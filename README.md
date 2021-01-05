# Gatsby Wikipedia Fetcher

<sup></sup>

## TL;DR

GatsbyJS plugin with the ability to retrieve various bits of Wikipedia data and reuse them in your site.

## Raison d'être

Wikipedia is the most successful collaborative knowledge base ever achieved on this planet. Just as we all contribute to it with our bits of information, it is only natural that we reach for it when we need to incorporate some of its data in other web projects. Luckily, this is made simple thanks to the excellent [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page).

Rather than trying to write the same again and again, we reuse what has already been written and reviewed at Wikipedia.

This project goes even a step further. Not only does it allow to embed bits and pieces of Wikipedia in your own Gatsby project, it also empowers you to _keep the information alive_. That is to say that any future updates provided by fellow humans around the world will automatically find their way to your site as well!

Copied data starts to age immediately whereas data included provided by an API is always accurate.

gatsby-wikipedia-fetcher is a plugin that makes it easy to pick larger or smaller pieces of various Wikipedia content (page extract, illustration image, etc.) and include them in your Gatsby site.
This plugin stands on the shoulders of the wonderful [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia) by [Spencer Kelly](https://github.com/spencermountain) et al.

## How to install

1. Install the package with **npm** or **yarn**

   `npm install gatsby-wikipedia-fetcher`

   `yarn add gatsby-wikipedia-fetcher`

2. Add to plugins in your **gatsby-config.js**

```javascript
module.exports = {
  plugins: [
    {
      resolve: `gatsby-wikipedia-fetcher`,
      options: {
        // E-mail address to be included in the Wikipedia API calls to limit the risk of being blacklisted.
        email: `user@example.com`,
      },
    },
  ],
}
```

## Examples of usage

@TODO

## Demo page

https://vacilando.org/article/interstellar-travel is an example of a page that shows both an illustration image and a textual extract from Wikipedia's page on [Interstellar travel](https://en.wikipedia.org/wiki/Interstellar_travel).

## Contributing

Every contribution is very much appreciated. You are welcome to file bugs, feature- and pull-requests at https://github.com/Vacilando/gatsby-wikipedia-fetcher/issues. If you have other questions or collaboration ideas, feel free to contact me directly at https://vacilando.org/contact.

## Thanks

This plugin stands on the shoulders of the excellent [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia) parser.

If this plugin is helpful for you, please star it on [GitHub](https://github.com/Vacilando/gatsby-plugin-security-txt).
<sup></sup>
