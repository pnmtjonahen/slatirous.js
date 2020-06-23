In this blog I will run a simple microservice on a k3s cluster. Using 7 Raspberry PI's and k3s a stripped-down kubernetes from Ranger Labs.

For my hardware I use 7 Rasberry PI's with a D-link hub to connect them. A Joy-it RB-Case+19 to house the PI's.


![My cluster](https://lh3.googleusercontent.com/pw/ACtC-3cXsLFmus5zE3cQOG4wvx1s2D8hN2rnBB4dNY34tfcWJ8GKAY83fmP1hyKQRwir02xCp1pfpynhXu_9kqrOsvjnFZaBrD4yXHNPoLT-zHugW34AF-YKgPQ9SxV9eNiESqYOgB_zyaggOlltqkELCPOIOQ=w250-h500-no?authuser=0)

Why this overload on hardware? Just because I had them laying around and needed a use case.

## basic setup
Setting up the PI's and installing all the needed software just follow the excellent blog post [Will it Cluster](https://blog.alexellis.io/test-drive-k3s-on-raspberry-pi/)

Just follow the above mentioned blog post. I used the following hostnames and static IP addresses
```
master 192.168.178.230
node0  192.168.178.240
node1  192.168.178.241
node2  192.168.178.242
node3  192.168.178.243
node4  192.168.178.244
node5  192.168.178.235
```

What I found is that after the `k3s` server was boodstraped I had to wait until all pods started where running before continuing.

## The 'Hello World' microservice
As there is a second reason why I wanted my pi cluster and that is to run some Rust code on it I'll start by building a simple hello world rust application.
```bash
cargo new k3s_hello_world --bin
```

Change the main.rs file to:
```code
use futures::future;
use hyper::rt::Future;
use hyper::service::service_fn;
use hyper::{Body, Request, Response, Server};


type BoxFuture = Box<dyn Future<Item = Response<Body>, Error = hyper::Error> + Send>;

fn handler_service(_req: Request<Body>) -> BoxFuture {
    Box::new(future::ok(Response::new(Body::from("Hello, World!"))))
}

fn main() {
    let addr = ([0, 0, 0, 0], 3000).into();

    let server = Server::bind(&addr)
        .serve(|| service_fn(handler_service))
        .map_err(|e| eprintln!("server error: {}", e));

    hyper::rt::run(server);
}
```
and add the following dependencies
```code
futures = "0.1"
hyper = "0.12"
```

Build it and run it the normal cargo way. You should now have a simple endpoint at [http://localhost:3000](http://localhost:3000) that responds with "Hello, world"

## Run in Docker
Next step is to create a docker image and run the microservice as a docker container.


```code
FROM ubuntu:latest
COPY ./target/release/k3s_hello_world /k3s_hello_world
ENTRYPOINT [ "k3s_hello_world" ]
```

This will create a x86 binary (depends on your current build platform), and will not run on a armv7 architecture. To fix this we need a correct binary and also a correct docker image.

## Cross Compile to armv7
Install the toolchain and compile/link the binary. See [Taking Rust everywhere with rustup](https://blog.rust-lang.org/2016/05/13/rustup.html).

```bash
cargo build --target=armv7-unknown-linux-gnueabihf --release
```

We now have a released binary that will run on a armv7, you can check this by copying the k3s_hello_world binary on one of your raspberry PI's and run it.

## Run in Docker
Next step is to also create a docker image that can be run on the PI. Update the docker file to include the correct binary and base image

```code
FROM arm32v7/ubuntu:latest
COPY ./target/armv7-unknown-linux-gnueabihf/release/k3s_hello_world /root/k3s_hello_world
ENTRYPOINT [ "k3s_hello_world" ]
```

If you try to run this docker image on your local machine it wil fail.

## Install on k3s
Now that we have our hello world binary and docker image in the correct platform we can deploy it on our cluster.

This was one of the harder steps to figure out, lots of information is found on the internet often it did not work, with some trail and error, samples and a lot of youtube I came up with the following:

Create a k3s_hello_world.yml file and add the following content:

```code
apiVersion: apps/v1
kind: Deployment
metadata:
  name: k3s-hello-world
  labels:
    app: k3s-hello-world
spec:
  replicas: 1
  selector:
    matchLabels:
      app: k3s-hello-world
  template:
    metadata:
      labels:
        app: k3s-hello-world
    spec:
      containers:
        - name: k3s-hello-world
          image: pnmtjonahen/k3s_hello_world:latest
          ports:
            - containerPort: 3000
---
apiVersion: v1
  kind: Service
  metadata:
    name: k3s-hello-world
  spec:
    ports:
    - port: 3000
      protocol: TCP
      targetPort: 3000
    type: NodePort
    selector:
      app: k3s-hello-world
---
apiVersion: extensions/v1beta1
  kind: Ingress
  metadata:
    name: k3s-hello-world
  spec:
    rules:
    - host: k3s-hello-world.tjonahen.home
      http:
        paths:
        - backend:
            serviceName: k3s-hello-world
            servicePort: 3000
          path:
```

and apply this on your k3s cluster

```bash
kubectl apply -f k3s_hello_world.yml
```

- the first part deploys the docker image on the cluster and starts a container.
- the second part creates a service that allows access to your container within the cluster.
- the third and last part configures Ingress, this creates a route to your container, using the k3s loadbalancer. This way we can reach our microservice from outside the cluster. Using the masters ip adress and domain name.

Check that all parts are running, open your browser en goto k3s-hello-world.yourdomain.ext, where yourdomain.ext is your domain.

What I also had to do is add an entry to my hosts file to allow name to IP mapping. 

## clean and lean
This is a working solution, however it needs a rather big ubuntu as a base image. As rust is able to create statically linked images we should be able to make a smaller images.

Using the following Dockerfile:
```code
FROM ekidd/rust-musl-builder as builder
USER rust
WORKDIR /home/rust/src/
COPY . .
RUN sudo chown -R rust *
RUN cargo build --target armv7-unknown-linux-musleabihf --release
RUN cargo install --target armv7-unknown-linux-musleabihf --path .

FROM arm32v7/alpine:latest
COPY --from=builder /home/rust/.cargo/bin/k3s_hello_world /usr/local/bin/k3s_hello_world
ENV RUST_LOG=warn
CMD ["k3s_hello_world"]

```

using
```bash
kubectl delete -f k3s_hello_world.yml
kubectl apply -f k3s_hello_world.yml
```

to update the k3s configuration. The delete is probably not needed bud just to be sure that the new docker images is pulled and all the other changes are picked up I deleted the config first before applying the new config.

## TL;DR;
Things I ran into:
- wait, wait, wait for it. The rPI 3B is not the fastest machine, the PI 4 works better. Bud wait for it to complete.
- google
- watch youtube
- read blogs


I now have a 7 node k3s cluster with a single master and 6 nodes, with a working rust end point.
Next will be:
- to create an actual application, frontend backend, database etc etc.
- scale up scale down

and do all kind of fun things with a cluster.

All code can be found on [](https://gitlab.com/pnmtjonahen/k3s_hello_world)


