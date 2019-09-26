September 2019, two weeks before I'll go to SpringOne conference, I decided to revive my blogging system.

First question was how to embed images in my blogs?, add some styling like headers and list.

## Embedding images.

Well let's use google photos for images. The trick is getting the correct image url.

Step one is of course have a photo on google photo, second is getting the correct link, open the image you want to embed and create a link to it. Open the link and you get a google photo page with a single image on it. Don't use the link as the img src but use the image url that is embedded on that link page. (right click on the image and get the image address).

![logo](https://lh3.googleusercontent.com/CgwcH7wZ8rM5Jg82D4YSnqOHyVEnoX-f840C2iCW2MCQbluIhSYHliwlmjNgBFEN0HOaa6UnnPoNH_SFTXu-qxjRnvbyc0Z7VFtq0aqzXZ3DpdE_03U1_unzS5VCaEizjHWp5zwbWrrCO36EctBbJ9nIGNTCc6OD2cVFiKwOMZfHL4IAa72nPKrJZr59kp2klIWvtRwvaUR1yxI0pmplMFj7HJLXx5pqwo51pnv6Xxq5VTUVlyOyGF5TiEO4ptIgcS0EtjG5G1k2y9WaO6rj3R8KaV6h5x4G-uP66DoDhWJj43N8VsHOxHgJTwdMdEciw6FgPNkjlORTNHyKn5vNKU4BST1y41nb8C-Q97gby8E1C_GZ15vKBrKX94-J9DlYBxJiGj1SmxOwGVuctN6BYkzGfAW47ZYSZQKVFCxRkeoHjFdItKjtpx-GHvKdG0EE5fruk9PtaIy3CEDeh1Fj5SXkhFPwVcfVNC0zX-AIOhC6fGLNlu3ZjaRkArCrXQ4M0U9P-Pz2JRDGLW4r5GhVCv4pV4o6pQt3GiAdzOe1sV1qNR5thniIZuG0aIgVBW7TQUHTrSBD-KaNCbzDadhzreCKQru4bAieWYu8TtiHxgEtDocTgDjmhcr9KSoFXrAAqJLbLJQNgV6Wf7ziLj1cP8kWgLnUjOi7qGMCGZ3mW-HZ8tbMyjeGiAUN3lTuLybMfh5J13ona2F-eMGUCwv9UaBJQvVhq12nEz03030xpdWHB5NVUw=w1362-h1021-no =100%xauto)

## Headers, codeblocks, links, etc. etc.

Used showdown [showdown](https://github.com/showdownjs/showdown) as an inspiration to create my own markdown parser. Not to reinvent the same code but a way to learn more about how showdown works. Using a lot of reg expressions to replace markdown syntax into correct html.


See the code of this application ;)
