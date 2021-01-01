# Gatsby Wikipedia Fetcher

<sup></sup>
## TL;DR

GatsbyJS plugin with the ability to retrieve various bits of Wikipedia data and reuse them in your site.

## Raison d'être

Wikipedia is the most successful collaborative knowledge base created by humankind. Just as we all contribute to it with our bits of information, it is only natural that we reach for it when we need to incorporate emergent wisdom in other web projects. This is made simple thanks to the excellent [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page).

The killer advantage of this approach that the data we use continues to live. Any future updates provided by fellow humans around the world will find their way to your site as well. 
Copied data starts to age immediately whereas data included provided by an API is always accurate.

gatsby-wikipedia-fetcher is a plugin that makes it easy to pick larger or smaller pieces of various Wikipedia content (page extract, illustration image, etc.) and include them in your Gatsby site. 
This plugin stands on the shoulders of the wonderful [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia) by [Spencer Kelly](https://github.com/spencermountain) et al.

    {
      resolve: `gatsby-wikipedia-fetcher`,
      options: {
        email: `tomi@vacilando.net`, // E-mail address to be mentioned in the Wikipedia API requests in order to lower the probability of being blocked.
      },
    },
