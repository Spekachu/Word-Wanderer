import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class words_translations extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    translation_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    word_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'words',
        key: 'word_id'
      }
    },
    language_code: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    translation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    literal_translation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    translation_rank: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'words_translations',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "idx_language",
        fields: [
          { name: "language_code" },
        ]
      },
      {
        name: "words_translations_pkey",
        unique: true,
        fields: [
          { name: "translation_id" },
        ]
      },
    ]
  });
  }
}
