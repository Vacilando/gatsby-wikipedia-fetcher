const wtf = require('wtf_wikipedia') // Syntax 'import wtf from "wtf_wikipedia"' would not work yet as this is run by node.js, see https://github.com/gatsbyjs/gatsby/issues/7810
wtf.extend(require('wtf-plugin-summary'))
wtf.extend(require('wtf-plugin-html'))

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
  // Accepted formats: 'Richard_Feynman' || 'Richard P. Feynman' || 'https://en.wikipedia.org/wiki/Richard_P._Feynman'
  // No need to swap spaces by underlines.
  var wikiArticles = []
  var wikiLangs = [] // Default language = none specified. wtf_wikipedia allows that for requests that are specific enough, like unique articles, full Wikipedia URLs, etc.

  // Here we need to supply the actual list of articles and languages. //////////////////////////////////////////////
  wikiArticles = [
    //'Richard P. Feynman',
    'Thor Heyerdahl',
    'Cosmology',
    'https://en.wikipedia.org/wiki/Cosmology',
  ]
  wikiLangs = ['en', 'en']
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (wikiArticles.length === 0) {
    wikiArticles = ['Richard P. Feynman'] // Set demo article if none is defined.
  }

  var wikiLang = wikiLangs.length !== 0 ? wikiLangs[0] : '' // Can be removed after fixing https://github.com/Vacilando/gatsby-wikipedia-fetcher/issues/1 Bundle requests by languages #1

  // https://www.gatsbyjs.com/docs/debugging-async-lifecycles/#use-promiseall-if-necessary
  /*
    const [summary, firstImage] = await Promise.all([
        wtf.fetch(wikiArticle, wikiLang, { 'Api-User-Agent': wikiUserAgentMail, }).then((doc) => doc ? doc.summary() : ""),
        wtf.fetch(wikiArticle).then((doc) => doc ? doc.images(0).url() : ""), // the full-size wikimedia-hosted url // https://github.com/spencermountain/wtf_wikipedia#docimages
    ])
    */
  var [page] = await Promise.all([
    //wtf.fetch(wikiArticle, wikiLang, { 'Api-User-Agent': wikiUserAgentMail, }).then((doc) => doc.summary()),
    wtf // Just 1 call for multiple wikipedia pages is good behaviour towards their API. Inspired by https://observablehq.com/@spencermountain/wtf_wikipedia-tutorial
      .fetch(wikiArticles, wikiLang, { 'Api-User-Agent': wikiUserAgentMail })
      .then(docList => {
        //var page = docList.map(doc => {
        return docList.map((doc, i) => {
          return {
            requestArticle: wikiArticles[i], // We need to know what was requested so that we later match this result to the vorg article.
            requestLang: wikiLang, // We need to know what was requested so that we later match this result to the vorg article.
            title: doc.title(),
            url: doc.url(), // (try to) generate the url for the current article
            summary: doc.summary(),
            extract: doc.sections(0).text(), // See https://github.com/spencermountain/wtf_wikipedia/issues/413
            extractHTML: doc.sections(0).html(), // See https://github.com/spencermountain/wtf_wikipedia/issues/413 // https://github.com/spencermountain/wtf_wikipedia/tree/master/plugins/html
            firstImage: doc.image(0).url(), // the full-size wikimedia-hosted url // https://github.com/spencermountain/wtf_wikipedia#docimages
          }
        })
        //console.log('page inside', page);
      }),
  ])
  console.log('page outside', page)

  page.forEach(async (val, i) => {
    // Crucial to use "async" in forEach in order to be able to use "await" for createRemoteFileNode

    // Processing requestArticle.
    var requestArticle = page[i].requestArticle
    console.log('requestArticle', requestArticle)

    // Processing requestLang
    var requestLang = page[i].requestLang
    console.log('requestLang', requestLang)

    // Processing title
    var title = page[i].title
    console.log('title', title)

    // Processing URL
    var url = page[i].url
    console.log('url', url)

    // Processing summary
    var summary = page[i].summary
    console.log('summary', summary)

    // Processing extract
    var extract = page[i].extract
    console.log('extract', extract)

    // Processing extract (in HTML)
    var extractHTML = page[i].extractHTML
    console.log('extractHTML', extractHTML)

    // Processing firstImage
    var firstImage = page[i].firstImage
    console.log('firstImage', firstImage)
    // Create a local version of the remote image. See https://www.gatsbyjs.com/docs/how-to/images-and-media/preprocessing-external-images/
    // https://www.gatsbyjs.com/plugins/gatsby-source-filesystem/

    ///*
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
    //*/

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
    console.log('nodeData', nodeData)

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
    console.log('nodeMeta', nodeMeta)

    // Now create the node.
    var node = Object.assign({}, nodeData, nodeMeta)
    // if the file was created, attach the new node to the parent node
    if (fileNode) {
      node.localFile___NODE = fileNode.id
    }
    createNode(node)
  })
}
