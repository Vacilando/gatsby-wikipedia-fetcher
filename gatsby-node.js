const path = require(`path`);

const wtf = require('wtf_wikipedia'); // Syntax 'import wtf from "wtf_wikipedia"' would not work yet as this is run by node.js, see https://github.com/gatsbyjs/gatsby/issues/7810
wtf.extend(require('wtf-plugin-summary'));
wtf.extend(require('wtf-plugin-html'));
wtf.extend(require('wtf-plugin-image'));

const { WikipediaFetcherList } = require(path.resolve(
  `./src/components/gatsby-wikipedia-fetcher-list`
));

// https://www.gatsbyjs.com/docs/how-to/images-and-media/preprocessing-external-images/
const { createRemoteFileNode } = require('gatsby-source-filesystem');
const { array } = require('prop-types');

/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

// https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#sourceNodes
// https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNode

exports.sourceNodes = async (
  {
    actions,
    createNodeId,
    createContentDigest,
    store,
    cache,
    getNodes,
    reporter,
  },
  pluginOptions
) => {
  const { createNode } = actions;

  reporter.info(`[gatsby-wikipedia-fetcher] Starting to fetch Wikipedia data.`);

  var wikiUserAgentMail = pluginOptions.email;

  // Here we need to supply the actual list of articles and languages. //////////////////////////////////////////////
  // wikiArticles should be an array of Wikipedia article titles (redirects are automatic) or full URLs.
  // E.g.: 'Richard_Feynman' || 'Richard P. Feynman' || 'https://en.wikipedia.org/wiki/Richard_P._Feynman'
  // No need to swap spaces by underlines.
  // Languages that match the Wikipedia articles in wikiArticles. Empty string is a possibility, e.g. for the cases where the article is specified by its full URL.
  // Default language = none specified. wtf_wikipedia allows that for requests that are specific enough, like unique articles, full Wikipedia URLs, etc.
  const wikiArticlesLanguages_initial = WikipediaFetcherList(getNodes);

  // Do not continue if there's no input data.
  if (
    !Array.isArray(wikiArticlesLanguages_initial) ||
    wikiArticlesLanguages_initial.length === 0
  ) {
    reporter.warn(
      `[gatsby-wikipedia-fetcher] There are no Wikipedia articles to be fetched.`
    );
    return;
  }

  // Deduplicate the array of objects -- see https://stackoverflow.com/questions/2218999/remove-duplicates-from-an-array-of-objects-in-javascript/36744732#36744732
  const things = new Object();
  things.thing = new Array();
  things.thing = wikiArticlesLanguages_initial;
  const wikiArticlesLanguages = things.thing.filter((thing, index) => {
    const _thing = JSON.stringify(thing);
    return (
      index ===
      things.thing.findIndex((obj) => {
        return JSON.stringify(obj) === _thing;
      })
    );
  });

  // https://www.gatsbyjs.com/docs/debugging-async-lifecycles/#use-promiseall-if-necessary
  /*
    const [summary, firstImage] = await Promise.all([
        wtf.fetch(wikiArticle, wikiLang, { 'Api-User-Agent': wikiUserAgentMail, }).then((doc) => doc ? doc.summary() : ""),
        wtf.fetch(wikiArticle).then((doc) => doc ? doc.images(0).url() : ""), // the full-size wikimedia-hosted url // https://github.com/spencermountain/wtf_wikipedia#docimages
    ])
    */

  /* Retrieving a number of pages at once is problematic because
   * How to link fetch requests with their results in bundled calls #417 https://github.com/spencermountain/wtf_wikipedia/issues/417
   * Fetching an array fails if there's a full URL #416 https://github.com/spencermountain/wtf_wikipedia/issues/416
   * How to specify language per article in a group fetch? #414 https://github.com/spencermountain/wtf_wikipedia/issues/414
   * So we put this on ice for a while and go for sequential calls for now.
   */
  /*
  var wikiLang = wikiLangs.length !== 0 ? wikiLangs[0] : '' // Can be removed after fixing https://github.com/Vacilando/gatsby-wikipedia-fetcher/issues/1 Bundle requests by languages #1

  var [page] = await Promise.all([
    wtf // Just 1 call for multiple wikipedia pages is good behaviour towards their API. Inspired by https://observablehq.com/@spencermountain/wtf_wikipedia-tutorial
      .fetch(wikiArticles, wikiLang, { 'Api-User-Agent': wikiUserAgentMail })
      .then(docList => {
        console.log('wikiArticles', wikiArticles)
        //console.log('docList.title()', docList.title())
        if (typeof docList[0] === 'undefined') {
          // docList is normally an array of objects, but due to a quirk in wtf_wikipedia it becomes just an object if there's just 1 result of the fetch. So we need to make an array of it. (NB wtf_wikipedia also deduplicates so [ 'Cosmology', 'https://en.wikipedia.org/wiki/Cosmology'] returns 1 result.)
          // See issue Fetching an array does not return array if there's just one item #418 https://github.com/spencermountain/wtf_wikipedia/issues/418
          docList = [docList]
        }
        //console.log('docList.title()', docList[0].title())
        return docList.map((doc, i) => {
          return {
            requestArticle: wikiArticles[i], // We need to know what was requested so that we later match this result to the vorg article.
            requestLang: wikiLang, // We need to know what was requested so that we later match this result to the vorg article.
            title: doc.title(),
            url: doc.url(), // (try to) generate the url for the current article
            summary: doc.summary(),
            extract: doc.sections(0).text(), // See https://github.com/spencermountain/wtf_wikipedia/issues/413
            extractHTML: doc.sections(0).html({ images: false }), // See https://github.com/spencermountain/wtf_wikipedia/issues/413 // https://github.com/spencermountain/wtf_wikipedia/tree/master/plugins/html // https://github.com/spencermountain/wtf_wikipedia/issues/415
            firstImage: doc.image(0).url(), // the full-size wikimedia-hosted url // https://github.com/spencermountain/wtf_wikipedia#docimages
          }
        })
        //console.log('page inside', page);
      }),
  ])
  console.log('page outside', page)
  page.forEach(async (val, i) => {
    // Crucial to use "async" in forEach in order to be able to use "await" for createRemoteFileNode
    ...
  }
  */

  var cachedGWF;
  var cacheReported = false;
  var milliSecondsCache = 0; // Default value = no cache (in case pluginOptions.cache is not set).
  if (pluginOptions.cache) {
    milliSecondsCache = pluginOptions.cache * 1000;
  }
  wikiArticlesLanguages.forEach(async (val, i) => {
    // Crucial to use "async" in forEach in order to be able to use "await" for createRemoteFileNode

    cachedGWF = await cache.get('gatsby-wikipedia-fetcher_cache_' + i); // https://www.gatsbyjs.com/docs/reference/config-files/node-api-helpers/#GatsbyCache
    if (cachedGWF && Date.now() - cachedGWF[1] > milliSecondsCache) {
      // If the cache expired, don't use it.
      cachedGWF = false;
    }
    if (!cachedGWF) {
      var [page] = await Promise.all([
        wtf // Just 1 call for multiple wikipedia pages is good behaviour towards their API. Inspired by https://observablehq.com/@spencermountain/wtf_wikipedia-tutorial
          .fetch(
            wikiArticlesLanguages[i].article,
            {
              lang: wikiArticlesLanguages[i].language,
              'Api-User-Agent': wikiUserAgentMail,
            }
          )
          .then((docList) => {
            if (typeof docList[0] === 'undefined') {
              // docList is normally an array of objects, but due to a quirk in wtf_wikipedia it becomes just an object if there's just 1 result of the fetch. So we need to make an array of it. (NB wtf_wikipedia also deduplicates so [ 'Cosmology', 'https://en.wikipedia.org/wiki/Cosmology'] returns 1 result.)
              // See issue Fetching an array does not return array if there's just one item #418 https://github.com/spencermountain/wtf_wikipedia/issues/418
              docList = [docList];
            }
            return docList.map((doc) => {
              // Get URL of the first image, if any https://www.npmjs.com/package/wtf-plugin-image
              let firstImageURL = doc.mainImage();
              if (firstImageURL) {
                firstImageURL = firstImageURL.commonsURL();
                let imgext = "jpg|jpeg|png|gif" // By default allow only jpg|jpeg|png|gif
                if (pluginOptions.imgext) {
                  imgext = pluginOptions.imgext
                }
                imgext = ".(" + imgext + ")$" // Eg ".(jpg|jpeg|png|gif)$"
                imgext = new RegExp(imgext, 'i')
                //if (!firstImageURL.match(/.(jpg|jpeg|png|gif)$/i)) {
                if (!firstImageURL.match(imgext)) {
                  firstImageURL = '';
                }
              } else {
                firstImageURL = '';
              }

              return {
                requestArticle: wikiArticlesLanguages[i].article, // We need to know what was requested so that we later match this result to the vorg article.
                requestLang: wikiArticlesLanguages[i].language, // We need to know what was requested so that we later match this result to the vorg article.
                title: doc.title(),
                url: doc.url(), // (try to) generate the url for the current article
                summary: doc.summary(),
                extract: doc.sections()[0].text(),
                extractHTML: doc.sections()[0].html({ images: false }),
                firstImage: firstImageURL,
              };
            });
          }),
      ]);
      page = page[0];
      await cache.set('gatsby-wikipedia-fetcher_cache_' + i, [
        page,
        Date.now(),
      ]);
      if (cacheReported === false) {
        // Report - but just once! - whether we use cache or not
        reporter.info(
          '[gatsby-wikipedia-fetcher] Fetching ' +
          wikiArticlesLanguages.length +
          ' items from Wikipedia API.'
        );
        cacheReported = true;
      }
    } else {
      page = cachedGWF[0];
      if (cacheReported === false) {
        // Report - but just once! - whether we use cache or not
        reporter.info(
          '[gatsby-wikipedia-fetcher] Fetching ' +
          wikiArticlesLanguages.length +
          ' Wikipedia items from Gatsby cache.'
        );
        cacheReported = true;
      }
    }

    // Processing requestArticle.
    var requestArticle = page.requestArticle;

    // Processing requestLang
    var requestLang = page.requestLang;

    // Processing title
    var title = page.title;

    // Processing URL
    var url = page.url;

    // Processing summary
    var summary = page.summary;

    // Processing extract
    var extract = page.extract;

    // Processing extract (in HTML)
    var extractHTML = page.extractHTML;

    // Processing firstImage
    var firstImage = page.firstImage;

    // Create a local version of the remote image. See https://www.gatsbyjs.com/docs/how-to/images-and-media/preprocessing-external-images/
    // https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/
    var fileNode = false;
    if (firstImage !== '') {
      // Create an image node only if firstImage is an empty string.
      fileNode = await createRemoteFileNode({
        url: firstImage,
        createNode,
        createNodeId,
        cache,
        store,
      });
    }

    // Custom data we want to store in the node.
    var nodeData = {
      requestArticle: requestArticle,
      requestLang: requestLang,
      title: title,
      url: url,
      summary: summary,
      extract: extract,
      extractHTML: extractHTML,
      firstImage: firstImage,
    };

    // Compulsory fields; see https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNode
    var nodeMeta = {
      id: createNodeId(`WikipediaFetcher-${JSON.stringify(nodeData)}`),
      parent: null,
      children: [],
      internal: {
        type: `WikipediaFetcher`,
        contentDigest: createContentDigest(nodeData), // Compulsory.
      },
    };

    // Now create the node.
    var node = Object.assign({}, nodeData, nodeMeta);
    // if the file was created, attach the new node to the parent node
    if (fileNode) {
      node.localFile___NODE = fileNode.id;
    }
    createNode(node);
  });
};
