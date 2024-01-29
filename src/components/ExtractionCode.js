import { v4 as uuidv4 } from "uuid";

function extractText(response, extractBy = "WORD") {
  const lineText = [];
  response.Blocks.forEach((block) => {
    if (block.BlockType === extractBy) {
      lineText.push(block.Text);
    }
  });
  return lineText;
}

function mapWordId(response) {
  const wordMap = {};
  response.Blocks.forEach((block) => {
    if (block.BlockType === "WORD") {
      wordMap[block.Id] = block.Text;
    }
    if (block.BlockType === "SELECTION_ELEMENT") {
      wordMap[block.Id] = block.SelectionStatus;
    }
  });
  return wordMap;
}

function mapWordDetail(response) {
  const dummyKeyValuePairs = [];
  for (let i = 0; i < response.Blocks.length; i++) {
    if (response.Blocks[i].BlockType === "WORD") {
      dummyKeyValuePairs.push({
        key: response.Blocks[i].Id,
        value: response.Blocks[i].Text,
        BoundingBox: response.Blocks[i].Geometry.BoundingBox,
      });
    }
  }
  return dummyKeyValuePairs;
}

function extractTableInfo(response, wordMap) {
  let row = [];
  const table = {};
  let ri = 0;
  let flag = false;
  let key = null;

  response.Blocks.forEach((block) => {
    if (block.BlockType === "TABLE") {
      key = `table_${uuidv4()}`;
      table[key] = [];
      flag = true;
    }
    if (block.BlockType === "CELL") {
      if (block.RowIndex !== ri) {
        flag = true;
        row = [];
        ri = block.RowIndex;
      }
      let cellText = "";
      if (block.Relationships) {
        block.Relationships.forEach((relation) => {
          if (relation.Type === "CHILD") {
            const ids = relation.Ids;
            cellText += ids.map((id) => wordMap[id]).join(" ");
          }
        });
      }
      row.push(cellText.trim());
      if (flag && key) {
        table[key].push(row);
        flag = false;
      }
    }
  });

  return table;
}

function getKeyMap(response, wordMap) {
  const keyMap = {};
  response.Blocks.forEach((block) => {
    if (
      block.BlockType === "KEY_VALUE_SET" &&
      block.EntityTypes.includes("KEY")
    ) {
      let valueId;
      let key = "";
      block.Relationships.forEach((relation) => {
        if (relation.Type === "VALUE") {
          valueId = relation.Ids;
        }
        if (relation.Type === "CHILD") {
          key = relation.Ids.map((id) => wordMap[id]).join(" ");
        }
      });
      keyMap[key] = valueId;
    }
  });
  return keyMap;
}

function getValueMap(response, wordMap) {
  const valueMap = {};
  response.Blocks.forEach((block) => {
    if (
      block.BlockType === "KEY_VALUE_SET" &&
      block.EntityTypes.includes("VALUE")
    ) {
      let value = "";
      if (block.Relationships) {
        block.Relationships.forEach((relation) => {
          if (relation.Type === "CHILD") {
            value = relation.Ids.map((id) => wordMap[id]).join(" ");
          }
        });
      } else {
        value = "VALUE_NOT_FOUND";
      }
      valueMap[block.Id] = value;
    }
  });
  return valueMap;
}

function getKvMap(keyMap, valueMap) {
  const finalMap = {};
  for (const key in keyMap) {
    finalMap[key] = keyMap[key].map((id) => valueMap[id]).join("");
  }
  return finalMap;
}

export {
  extractText,
  mapWordId,
  extractTableInfo,
  getKeyMap,
  getValueMap,
  getKvMap,
  mapWordDetail,
};
