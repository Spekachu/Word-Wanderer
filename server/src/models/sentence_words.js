import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class sentence_words extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    sentence_word_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sentence_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sentences',
        key: 'sentence_id'
      }
    },
    word_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'words',
        key: 'word_id'
      }
    }
  }, {
    sequelize,
    tableName: 'sentence_words',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "sentence_words_pkey",
        unique: true,
        fields: [
          { name: "sentence_word_id" },
        ]
      },
    ]
  });
  }
}
