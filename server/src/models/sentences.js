import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class sentences extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    sentence_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
    tableName: 'sentences',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "sentences_pkey",
        unique: true,
        fields: [
          { name: "sentence_id" },
        ]
      },
    ]
  });
  }
}
