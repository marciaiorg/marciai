/// <reference path="../pb_data/types.d.ts" />

// User vote for a prompt
routerAdd("POST", "/Vote/{promptID}", (e) => {
    return e.json(200, {})
})

// User use a prompt
routerAdd("POST", "/Prompts/{promptID}/Use", (e) => {
    return e.json(200, {})
})

// Create new prompt
routerAdd("POST", "/Prompts", (e) => {
    const payload = e.requestInfo().body

    return e.json(200, {
        "Activity": payload["Activity"],
        "AuthorName": payload["AuthorName"],
        "AuthorURL": "",
        "AuxIndexS": null,
        "CreationTime": "2025-03-28T20:17:38.707586477Z",
        "EndpointS": null,
        "GizmoCodeS": null,
        "Help": "",
        "ID": "2071296987638800384",
        "ModelS": null,
        "Prompt": payload["Prompt"],
        "PromptFeatureBitset": 0,
        "PromptHint": payload["PromptHint"],
        "PromptTypeNo": 1,
        "RevisionTime": "2025-03-28T20:17:38.707586477Z",
        "SystemS": [1],
        "Teaser": payload["Teaser"],
        "Title": payload["Title"],
        "Topic": payload["Topic"]
    }
    )
})

// Update a prompt
routerAdd("POST", "/Prompts/{promptID}", (e) => {
    const payload = e.requestInfo().body
    const promptID = e.request.pathValue("promptID")

    return e.json(200, {
        "Activity": payload["Activity"],
        "AuthorName": payload["AuthorName"],
        "AuthorURL": "",
        "AuxIndexS": null,
        "CreationTime": "2025-03-28T20:17:38.707586477Z",
        "EndpointS": null,
        "GizmoCodeS": null,
        "Help": "",
        "ID": promptID,
        "ModelS": null,
        "Prompt": payload["Prompt"],
        "PromptFeatureBitset": 0,
        "PromptHint": payload["PromptHint"],
        "PromptTypeNo": 1,
        "RevisionTime": "2025-03-28T20:17:38.707586477Z",
        "SystemS": [1],
        "Teaser": payload["Teaser"],
        "Title": payload["Title"],
        "Topic": payload["Topic"]
    }
    )
})

// User report a prompt
routerAdd("POST", "/Prompts/{promptID}/Feedback", (e) => {
    return e.json(200, {})
})

// Create a new list
routerAdd("POST", "/Lists", (e) => {
    return e.json(200, {})
})

// Add prompt to list
routerAdd("POST", "/List/{listID}/Items", (e) => {
    const listID = e.request.pathValue("listID")
    const promptID = e.requestInfo().body["PromptID"]

    return e.json(200, {
        "Comment": "",
        "CreationTime": "2025-03-28T19:48:23.71728062Z",
        "ItemOrder": 0,
        "ItemStatusNo": 100,
        "ListID": listID,
        "PromptID": promptID,
        "RevisionTime": "2025-03-28T19:48:23.71728067Z"
    })
})

// Delete an prompt from a list
routerAdd("DELETE", "/List/{listID}/Items/{itemID}", (e) => {
    return e.json(200, {})
})
