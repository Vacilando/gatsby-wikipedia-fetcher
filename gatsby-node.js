const path = require(`path`)

const wtf = require(path.resolve(
  './plugins/gatsby-wikipedia-fetcher/node_modules/wtf_wikipedia'
)) // Syntax 'import wtf from "wtf_wikipedia"' would not work yet as this is run by node.js, see https://github.com/gatsbyjs/gatsby/issues/7810
wtf.extend(
  require(path.resolve(
    './plugins/gatsby-wikipedia-fetcher/node_modules/wtf-plugin-summary'
  ))
)
wtf.extend(
  require(path.resolve(
    './plugins/gatsby-wikipedia-fetcher/node_modules/wtf-plugin-html'
  ))
)

const { WikipediaFetcherList } = require(path.resolve(
  `./src/components/gatsby-wikipedia-fetcher-list`
))
//console.log('WikipediaFetcherList', WikipediaFetcherList())

// https://www.gatsbyjs.com/docs/how-to/images-and-media/preprocessing-external-images/
const { createRemoteFileNode } = require('gatsby-source-filesystem')

/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

// https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#sourceNodes
// https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNode

exports.sourceNodes = async (
  { actions, createNodeId, createContentDigest, store, cache },
  pluginOptions
) => {
  const { createNode } = actions

  var wikiUserAgentMail = pluginOptions.email

  // Here we need to supply the actual list of articles and languages. //////////////////////////////////////////////
  // wikiArticles should be an array of Wikipedia article titles (redirects are automatic) or full URLs.
  // E.g.: 'Richard_Feynman' || 'Richard P. Feynman' || 'https://en.wikipedia.org/wiki/Richard_P._Feynman'
  // No need to swap spaces by underlines.
  // Languages that match the Wikipedia articles in wikiArticles. Empty string is a possibility, e.g. for the cases where the article is specified by its full URL.
  // Default language = none specified. wtf_wikipedia allows that for requests that are specific enough, like unique articles, full Wikipedia URLs, etc.
  var wikiArticlesLanguages = WikipediaFetcherList()
  //console.log('wikiArticlesLanguages', wikiArticlesLanguages)

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

  wikiArticlesLanguages.forEach(async (val, i) => {
    // Crucial to use "async" in forEach in order to be able to use "await" for createRemoteFileNode

    var [page] = await Promise.all([
      wtf // Just 1 call for multiple wikipedia pages is good behaviour towards their API. Inspired by https://observablehq.com/@spencermountain/wtf_wikipedia-tutorial
        .fetch(
          wikiArticlesLanguages[i].article,
          wikiArticlesLanguages[i].language,
          {
            'Api-User-Agent': wikiUserAgentMail,
          }
        )
        .then(docList => {
          //console.log('wikiArticles[i]', wikiArticles[i])
          //console.log('docList.title()', docList.title())
          //console.log('typeof docList[0]', typeof docList[0])
          if (typeof docList[0] === 'undefined') {
            // docList is normally an array of objects, but due to a quirk in wtf_wikipedia it becomes just an object if there's just 1 result of the fetch. So we need to make an array of it. (NB wtf_wikipedia also deduplicates so [ 'Cosmology', 'https://en.wikipedia.org/wiki/Cosmology'] returns 1 result.)
            // See issue Fetching an array does not return array if there's just one item #418 https://github.com/spencermountain/wtf_wikipedia/issues/418
            docList = [docList]
          }
          //console.log('docList.title()', docList[0].title())
          return docList.map(doc => {
            return {
              requestArticle: wikiArticlesLanguages[i].article, // We need to know what was requested so that we later match this result to the vorg article.
              requestLang: wikiArticlesLanguages[i].language, // We need to know what was requested so that we later match this result to the vorg article.
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
    //console.log('page outside', page)

    page = page[0]

    // Processing requestArticle.
    var requestArticle = page.requestArticle
    //console.log('requestArticle', requestArticle)

    // Processing requestLang
    var requestLang = page.requestLang
    //console.log('requestLang', requestLang)

    // Processing title
    var title = page.title
    //console.log('title', title)

    // Processing URL
    var url = page.url
    //console.log('url', url)

    // Processing summary
    var summary = page.summary
    //console.log('summary', summary)

    // Processing extract
    var extract = page.extract
    //console.log('extract', extract)

    // Processing extract (in HTML)
    var extractHTML = page.extractHTML
    //console.log('extractHTML', extractHTML)

    // Processing firstImage
    var firstImage = page.firstImage
    //console.log('firstImage', firstImage)
    // Create a local version of the remote image. See https://www.gatsbyjs.com/docs/how-to/images-and-media/preprocessing-external-images/
    // https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/

    var fileNode = false
    if (firstImage) {
      fileNode = await createRemoteFileNode({
        url: firstImage,
        //parentNodeId: nodeID,
        createNode,
        createNodeId,
        cache,
        store,
      })
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
      //localFile: fileNode ? fileNode.id : '',
    }
    //console.log('nodeData', nodeData)

    // Compulsory fields; see https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNode
    var nodeMeta = {
      id: createNodeId(`WikipediaFetcher-${JSON.stringify(nodeData)}`),
      parent: null,
      children: [],
      internal: {
        type: `WikipediaFetcher`,
        //mediaType: `text/html`, // Optional.
        //content: JSON.stringify(myData), // Optional.
        contentDigest: createContentDigest(nodeData), // Compulsory.
      },
    }
    //console.log('nodeMeta', nodeMeta)

    // Now create the node.
    var node = Object.assign({}, nodeData, nodeMeta)
    // if the file was created, attach the new node to the parent node
    if (fileNode) {
      node.localFile___NODE = fileNode.id
    }
    createNode(node)
  })
}
