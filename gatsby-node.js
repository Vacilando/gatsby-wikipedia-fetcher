const wtf = require('wtf_wikipedia') // import wtf from "wtf_wikipedia" - this syntax does not work yet as this is run by node.js, see https://github.com/gatsbyjs/gatsby/issues/7810
wtf.extend(require('wtf-plugin-summary'))

// https://www.gatsbyjs.com/docs/how-to/images-and-media/preprocessing-external-images/
const { createRemoteFileNode } = require("gatsby-source-filesystem")

/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

// https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#sourceNodes
// https://www.gatsbyjs.com/docs/reference/config-files/actions/#createNode

exports.sourceNodes = async ({
    actions, createNodeId, createContentDigest,
    store, cache, }) => {

    const { createNode } = actions

    var wikiArticle = 'Richard P. Feynman' // 'Richard_Feynman' || 'Richard P. Feynman' || 'https://en.wikipedia.org/wiki/Richard_P._Feynman'
    var wikiLang = 'en'
    var wikiUserAgentMail = 'tomi@vacilando.net'
    //wikiArticle = wikiArticle.replace(/ /g, "_") // Replace spaces by underlines.
    //console.log('wikiArticle', wikiArticle)

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
            .fetch([wikiArticle, 'Aldous Huxley'], wikiLang, { 'Api-User-Agent': wikiUserAgentMail, })
            .then((docList) => {
                //var page = docList.map(doc => {
                return docList.map(doc => {
                    return {
                        title: doc.title(),
                        summary: doc.summary(),
                        extract: doc.sections(0).text(), // See https://github.com/spencermountain/wtf_wikipedia/issues/413
                        firstImage: doc.image(0).url(), // the full-size wikimedia-hosted url // https://github.com/spencermountain/wtf_wikipedia#docimages
                    }
                })
                //console.log('page inside', page);
            })
    ])
    console.log('page outside', page);

    page.forEach(async (val, i) => { // Crucial to use "async" in forEach in order to be able to use "await" for createRemoteFileNode
        // Processing summary
        var summary = page[i].summary
        console.log('summary', summary)

        // Processing extract
        var extract = page[i].extract
        console.log('extract', extract)

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
            summary: summary,
            extract: extract,
            firstImage: firstImage,
            localFile: fileNode ? fileNode.id : "",
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
                contentDigest: createContentDigest(nodeData) // Compulsory.
            }
        }
        console.log('nodeMeta', nodeMeta)

        // Now create the node.
        var node = Object.assign({}, nodeData, nodeMeta)
        createNode(node)

    })


}