import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class words extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    word_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    part_of_speech: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    level: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    frequency_score: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'words',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "words_pkey",
        unique: true,
        fields: [
          { name: "word_id" },
        ]
      },
    ]
  });
  }
}
