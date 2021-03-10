# Gatsby Wikipedia Fetcher

<sup></sup>
## TL;DR

GatsbyJS plugin with the ability to retrieve various bits of Wikipedia data and reuse them in your site.

## Raison d'être

Wikipedia is the most successful collaborative knowledge base ever achieved on this planet. Just as we all contribute to it with our bits of knowledge, it is only natural that we reach for it when we need to incorporate some of its information in other web projects.

Rather than trying to write the same again and again, we reuse what has already been written and reviewed at Wikipedia. Luckily, this is made simple thanks to the excellent [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page).

gatsby-wikipedia-fetcher is a plugin that makes it easy to pick larger or smaller pieces of various Wikipedia content (page extract, illustration image, etc.) and include them in your Gatsby site.

Further, it also empowers you to _keep the information alive_. That is to say that any future updates provided by fellow humans around the world will automatically find their way to your site as well. This plugin makes it easy for you to constantly refresh the fetched data with the new versions provided by the Wikipedia API.

## Features

This plugin is currently able to fetch the following data for each of the specified Wikipedia pages:

- title = Wikipedia page title (after redirects, if any)
- url = Wikipedia page URL (after redirects, if any)
- summary = One-line summary of the Wikipedia page
- extract = Textual extract from the Wikipedia page; this is the same page delivered on the first page of Google search results when the search matches some Wikipedia entry.
- extractHTML = Same as "extract" but includes the HTML from Wikipedia (links, etc.)
- firstImage = The first image (if any) from the Wikipedia page; ideal for illustrations on theme pages etc.

If you regularly need to retrieve some other pieces of data, please make a request by creating a ticket at https://github.com/Vacilando/gatsby-wikipedia-fetcher/issues.

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

3. Create a file called "gatsby-wikipedia-fetcher-list.js" in your "components" folder (./src/components/gatsby-wikipedia-fetcher-list.js) and paste in the following

```javascript
/**
 * Supply a list of Wikipedia articles and their languages to gatsby-wikipedia-fetcher.
 */
const WikipediaFetcherList = getNodes => {
  // Array of Wikipedia article titles (redirects are automatic) or full URLs and their language codes (may be empty strings).
  var articlesLanguages = [
    { article: 'Richard P. Feynman', language: 'en' },
    { article: 'https://en.wikipedia.org/wiki/Cosmology', language: 'en' },
    { article: 'Thor Heyerdahl', language: 'en' },
  ]

  return articlesLanguages
}

module.exports.WikipediaFetcherList = WikipediaFetcherList
```

You can generate the array any way you wish as long as its format is maintained (array of objects consisting of article and language properties). You can use function getNodes() as a source of data. The exact implementation will depend on your data sources and structure.

In the following example we retrieve the data from node fields field_wikipedia_article and field_wikipedia_language like this:

```javascript
var articlesLanguages = []
getNodes().forEach(node => {
  if (node.field_wikipedia_article) {
    articlesLanguages.push({
      article: node.field_wikipedia_article,
      language: node.field_wikipedia_language,
    })
  }
})
```

4. In your http://localhost:8000/___graphql you will find new items "allWikipediaFetcher" and "wikipediaFetcher" populated with data fetched from the specified Wikipedia pages.

## Demo page

https://vacilando.org/article/cosmology is an example of a page that shows both an illustration image and a textual extract from Wikipedia's page on [Cosmology](https://en.wikipedia.org/wiki/Cosmology).

We also welcome links to sites that make use of this plugin. Send us a representative URL via https://vacilando.org/contact and we will consider it for inclusion on the  [documentation page](https://vacilando.org/article/gatsby-wikipedia-fetcher).

## Contributing

Every contribution is very much appreciated. You are welcome to file bugs, feature- and pull-requests at https://github.com/Vacilando/gatsby-wikipedia-fetcher/issues. If you have other questions or collaboration ideas, feel free to contact the maintainer directly at https://vacilando.org/contact.

## Maintenance and development

Developed and maintained by [Vacilando](https://github.com/Vacilando) since 2020/12/18 — see the [main article](https://vacilando.org/article/gatsby-wikipedia-fetcher).

This plugin stands on the shoulders of the excellent [wtf_wikipedia](https://github.com/spencermountain/wtf_wikipedia) parser by [Spencer Kelly](https://github.com/spencermountain) et al.

If this plugin is helpful for you, please star it on [GitHub](https://github.com/Vacilando/gatsby-wikipedia-fetcher).
<sup></sup>
