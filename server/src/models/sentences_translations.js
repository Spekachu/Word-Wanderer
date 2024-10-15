import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class sentences_translations extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    translation_id: {
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
    tableName: 'sentences_translations',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "sentences_translations_pkey",
        unique: true,
        fields: [
          { name: "translation_id" },
        ]
      },
    ]
  });
  }
}
