/// <reference path="../pb_data/types.d.ts" />

// User vote for a prompt
routerAdd("POST", "/Vote/{promptID}", (e) => {
  return e.json(200, {});
});

// User use a prompt
routerAdd("POST", "/Prompts/{promptID}/Use", (e) => {
  return e.json(200, {});
});

// Get a prompt
routerAdd("GET", "/Prompts/{promptID}", (e) => {
  const helpers = require(`${__hooks}/helpers.js`);

  const promptID = e.request.pathValue("promptID");
  const search = e.requestInfo().query;
  const userId = search["OperatorERID"] || null;

  if (!userId) {
    return e.json(400, {
      error: "User ID is required",
    });
  }
  const prompt = $app.findRecordById("prompts", promptID);

  if (!prompt) {
    return e.json(400, {
      error: "Prompt not found",
    });
  }

  // Only allow get public prompt or own prompt
  if (
    prompt.getInt("PromptTypeNo") == 2 ||
    prompt.getString("CreatedBy") === userId
  ) {
    return e.json(200, helpers.toClientPrompt(prompt.publicExport()));
  }

  return e.json(400, {
    error: "Bad request",
  });
});

// Delete a prompt
routerAdd("DELETE", "/Prompts/{promptID}", (e) => {
  const helpers = require(`${__hooks}/helpers.js`);

  const promptID = e.request.pathValue("promptID");
  const search = e.requestInfo().query;
  const userId = search["OperatorERID"] || null;

  if (!userId) {
    return e.json(400, {
      error: "User ID is required",
    });
  }
  const prompt = $app.findRecordById("prompts", promptID);

  if (!prompt) {
    return e.json(400, {
      error: "Prompt not found",
    });
  }

  if (prompt.getString("CreatedBy") != userId) {
    return e.json(400, {
      error: "Bad request",
    });
  }

  $app.delete(prompt);

  return e.json(200, {});
});

routerAdd("GET", "/Prompts", (e) => {
  const helpers = require(`${__hooks}/helpers.js`);

  const search = e.requestInfo().query;
  const OwnerOperatorERID = search["OwnerOperatorERID"] || null;
  const Topic = search["Topic"];
  const SortModeNo = search["SortModeNo"];

  let prompts = helpers.getPrompts({
    userId: OwnerOperatorERID,
    Topic,
    SortModeNo,
  });

  prompts = prompts.map((prompt) => {
    const clientPrompt = prompt.publicExport();

    clientPrompt["OwnPrompt"] = clientPrompt["CreatedBy"] === OwnerOperatorERID;
    return helpers.toClientPrompt(clientPrompt);
  });

  return e.json(200, prompts);
});

// Create new prompt
routerAdd("POST", "/Prompts", (e) => {
  const helpers = require(`${__hooks}/helpers.js`);
  const payload = e.requestInfo().body;
  const userId = payload["User"]["OperatorERID"];

  if (!userId) {
    return e.json(400, {
      error: "User ID is required",
    });
  }

  let collection = $app.findCollectionByNameOrId("prompts");
  let record = new Record(collection);

  record.set("Activity", payload["Activity"]);
  record.set("AuthorName", payload["AuthorName"]);
  record.set("AuthorURL", payload["AuthorURL"]);
  record.set("Teaser", payload["Teaser"]);
  record.set("Title", payload["Title"]);
  record.set("Topic", payload["Topic"]);
  record.set("ModelS", payload["ModelS"]);
  record.set("Prompt", payload["Prompt"]);
  record.set("PromptTypeNo", payload["PromptTypeNo"]);
  record.set("PromptHint", payload["PromptHint"]);
  record.set("CreatedBy", userId);
  record.set("PromptFeatureBitset", 0);
  record.set("RevisionTime", new Date().toISOString());
  record.set("AuxIndexS", []);
  record.set("EndpointS", []);
  record.set("GizmoCodeS", []);
  record.set("SystemS", [1]);
  record.set("Votes", 0);
  record.set("Usages", 0);
  record.set("Views", 0);

  $app.save(record);

  return e.json(200, helpers.toClientPrompt(record.publicExport()));
});

// Update a prompt
routerAdd("POST", "/Prompts/{promptID}", (e) => {
  const helpers = require(`${__hooks}/helpers.js`);

  const payload = e.requestInfo().body;
  const promptID = e.request.pathValue("promptID");
  const userId = payload["User"]["OperatorERID"];

  if (!userId) {
    return e.json(400, {
      error: "User ID is required",
    });
  }

  let record = $app.findRecordById("prompts", promptID);
  if (!record) {
    return e.json(400, {
      error: "Prompt not found",
    });
  }

  if (record.getString("CreatedBy") != userId) {
    return e.json(400, {
      error: "Bad request",
    });
  }

  record.set("Activity", payload["Activity"]);
  record.set("AuthorName", payload["AuthorName"]);
  record.set("AuthorURL", payload["AuthorURL"]);
  record.set("Teaser", payload["Teaser"]);
  record.set("PromptHint", payload["PromptHint"]);
  record.set("Title", payload["Title"]);
  record.set("Topic", payload["Topic"]);
  record.set("ModelS", payload["ModelS"]);
  record.set("Prompt", payload["Prompt"]);
  record.set("PromptTypeNo", payload["PromptTypeNo"]);

  $app.save(record);

  return e.json(200, helpers.toClientPrompt(record.publicExport()));
});

// User report a prompt
routerAdd("POST", "/Prompts/{promptID}/Feedback", (e) => {
  return e.json(200, {});
});

// Create a new list
routerAdd("POST", "/Lists", (e) => {
  return e.json(200, {});
});

routerAdd("GET", "/Lists/All/User", (e) => {
  const helpers = require(`${__hooks}/helpers.js`);

  const search = e.requestInfo().query;
  const userId = search["OperatorERID"] || null;

  if (!userId) {
    return e.json(400, {
      error: "User ID is required",
    });
  }

  // Get all lists for the user
  const listRecords = $app.findRecordsByFilter(
    "lists",
    "CreatedBy = {:userId}",
    "",
    0,
    0,
    {
      userId: userId,
    }
  );

  if (!listRecords || listRecords.length === 0) {
    // Create a favorite list if it doesn't exist
    const favoriteList = new Record($app.findCollectionByNameOrId("lists"));
    favoriteList.set("Comment", "");
    favoriteList.set("ListOrder", 0);
    favoriteList.set("ListStatusNo", 100);
    favoriteList.set("ListTypeNo", 4);
    favoriteList.set("RevisionTime", new Date().toISOString());
    favoriteList.set("CreatedBy", userId);

    $app.save(favoriteList);

    return e.json(200, [
      helpers.toClientList(favoriteList.publicExport(), [], userId),
    ]);
  }

  const clientLists = listRecords.map((record) => {
    const ListID = record.get("id");
    let listItems = $app.findRecordsByFilter(
      "listItems",
      "ListID = {:ListID}",
      "",
      0,
      0,
      {
        ListID: ListID,
      }
    );
    const clientListItems = listItems.map((item) =>
      helpers.toClientListItem(item.publicExport())
    );

    return helpers.toClientList(record.publicExport(), clientListItems, userId);
  });

  return e.json(200, clientLists);
});

// Add prompt to list
routerAdd("POST", "/List/{listID}/Items", (e) => {
  const helpers = require(`${__hooks}/helpers.js`);

  const listID = e.request.pathValue("listID");

  const payload = e.requestInfo().body;
  const promptID = payload["PromptID"];
  const userId = payload["User"]?.["OperatorERID"];

  if (!userId) {
    return e.json(400, {
      error: "User ID is required",
    });
  }

  let listRecord = $app.findRecordById("lists", listID);
  if (!listRecord) {
    return e.json(400, {
      error: "List doesn't exists",
    });
  }

  if (listRecord.get("CreatedBy") != userId) {
    return e.json(400, {
      error: "Incorrect user",
    });
  }

  let listItemCollection = $app.findCollectionByNameOrId("listItems");
  let listItemRecord = new Record(listItemCollection);

  listItemRecord.set("Comment", payload["Comment"] || "");
  listItemRecord.set("ItemOrder", payload["ItemOrder"]);
  listItemRecord.set("ItemStatusNo", payload["ItemStatusNo"]);
  listItemRecord.set("PromptID", promptID);
  listItemRecord.set("ListID", listID);
  listItemRecord.set("RevisionTime", new Date().toISOString());

  $app.save(listItemRecord);

  return e.json(200, helpers.toClientListItem(listItemRecord.publicExport()));
});

// Delete an prompt from a list
routerAdd("DELETE", "/List/{listID}/Items/{promptID}", (e) => {
  const search = e.requestInfo().query;
  const userId = search["OperatorERID"] || null;
  const listID = e.request.pathValue("listID");
  const promptID = e.request.pathValue("promptID");

  if (!userId) {
    return e.json(400, {
      error: "User ID is required",
    });
  }

  let listRecord = $app.findRecordById("lists", listID);
  if (!listRecord) {
    return e.json(400, {
      error: "List doesn't exists",
    });
  }

  if (listRecord.get("CreatedBy") != userId) {
    return e.json(400, {
      error: "Incorrect user",
    });
  }

  const records = $app.findRecordsByFilter(
    "listItems",
    "ListID = {:ListID} && PromptID = {:PromptID}",
    "",
    0,
    0,
    {
      ListID: listID,
      PromptID: promptID,
    }
  );

  if (records) {
    records.forEach((record) => {
      $app.delete(record);
    });
  }

  return e.json(200, {});
});
