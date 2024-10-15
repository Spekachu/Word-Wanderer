import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _contexts from  "./contexts.js";
import _sentence_contexts from  "./sentence_contexts.js";
import _sentence_words from  "./sentence_words.js";
import _sentences from  "./sentences.js";
import _sentences_translations from  "./sentences_translations.js";
import _user_word_associations from  "./user_word_associations.js";
import _users from  "./users.js";
import _word_contexts from  "./word_contexts.js";
import _words from  "./words.js";
import _words_translations from  "./words_translations.js";

export default function initModels(sequelize) {
  const contexts = _contexts.init(sequelize, DataTypes);
  const sentence_contexts = _sentence_contexts.init(sequelize, DataTypes);
  const sentence_words = _sentence_words.init(sequelize, DataTypes);
  const sentences = _sentences.init(sequelize, DataTypes);
  const sentences_translations = _sentences_translations.init(sequelize, DataTypes);
  const user_word_associations = _user_word_associations.init(sequelize, DataTypes);
  const users = _users.init(sequelize, DataTypes);
  const word_contexts = _word_contexts.init(sequelize, DataTypes);
  const words = _words.init(sequelize, DataTypes);
  const words_translations = _words_translations.init(sequelize, DataTypes);

  contexts.belongsToMany(sentences, { as: 'sentence_id_sentences', through: sentence_contexts, foreignKey: "context_id", otherKey: "sentence_id" });
  contexts.belongsToMany(words, { as: 'word_id_words', through: word_contexts, foreignKey: "context_id", otherKey: "word_id" });
  sentences.belongsToMany(contexts, { as: 'context_id_contexts', through: sentence_contexts, foreignKey: "sentence_id", otherKey: "context_id" });
  words.belongsToMany(contexts, { as: 'context_id_contexts_word_contexts', through: word_contexts, foreignKey: "word_id", otherKey: "context_id" });
  sentence_contexts.belongsTo(contexts, { as: "context", foreignKey: "context_id"});
  contexts.hasMany(sentence_contexts, { as: "sentence_contexts", foreignKey: "context_id"});
  word_contexts.belongsTo(contexts, { as: "context", foreignKey: "context_id"});
  contexts.hasMany(word_contexts, { as: "word_contexts", foreignKey: "context_id"});
  sentence_contexts.belongsTo(sentences, { as: "sentence", foreignKey: "sentence_id"});
  sentences.hasMany(sentence_contexts, { as: "sentence_contexts", foreignKey: "sentence_id"});
  sentence_words.belongsTo(sentences, { as: "sentence", foreignKey: "sentence_id"});
  sentences.hasMany(sentence_words, { as: "sentence_words", foreignKey: "sentence_id"});
  sentences_translations.belongsTo(sentences, { as: "sentence", foreignKey: "sentence_id"});
  sentences.hasMany(sentences_translations, { as: "sentences_translations", foreignKey: "sentence_id"});
  user_word_associations.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(user_word_associations, { as: "user_word_associations", foreignKey: "user_id"});
  sentence_words.belongsTo(words, { as: "word", foreignKey: "word_id"});
  words.hasMany(sentence_words, { as: "sentence_words", foreignKey: "word_id"});
  user_word_associations.belongsTo(words, { as: "word", foreignKey: "word_id"});
  words.hasMany(user_word_associations, { as: "user_word_associations", foreignKey: "word_id"});
  word_contexts.belongsTo(words, { as: "word", foreignKey: "word_id"});
  words.hasMany(word_contexts, { as: "word_contexts", foreignKey: "word_id"});
  words_translations.belongsTo(words, { as: "word", foreignKey: "word_id"});
  words.hasMany(words_translations, { as: "words_translations", foreignKey: "word_id"});

  return {
    contexts,
    sentence_contexts,
    sentence_words,
    sentences,
    sentences_translations,
    user_word_associations,
    users,
    word_contexts,
    words,
    words_translations,
  };
}
