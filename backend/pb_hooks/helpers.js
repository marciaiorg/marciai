const globalData = require(`./globalData.js`);

const toClientPrompt = (prompt) => {
  prompt["ID"] = prompt["id"];
  prompt["CreatedBy"] = "";

  return prompt;
};
exports.toClientPrompt = toClientPrompt;

const toClientList = (list, listItems, userId) => {
  list["ID"] = list["id"];
  list["OwnList"] = list["CreatedBy"] == userId;
  list["CreatedBy"] = "";
  list["CreationTime"] = list["created"];
  list["Items"] = listItems;

  return list;
};
exports.toClientList = toClientList;

const toClientListItem = (listItem) => {
  listItem["ID"] = listItem["id"];
  listItem["CreationTime"] = listItem["created"];

  return listItem;
};
exports.toClientListItem = toClientListItem;

exports.getPrompts = ({
    userId,
    Topic,
    SortModeNo,
}) => {
    const SortModeNoMap = {
        8: "-Usages",
        2: "-Votes",
        16: "-Votes",
        1: "-Views",
        4: "-RevisionTime"
      };

      let filter = "(PromptTypeNo = 2 || CreatedBy = {:userID})"
      if (Topic) {
        filter += " && Topic = {:topic}"
      }

  let records = $app.findRecordsByFilter(
    "prompts", // collection
    filter, // filter public prompt type
    SortModeNoMap[SortModeNo], // sort
    0, // limit
    0, // offset
    {
        userID: userId,
        topic: Topic
    }
  );

  records = records.map((record) => {
    record.set("Prompt", "");
    return record;
  });

  return records;
};
