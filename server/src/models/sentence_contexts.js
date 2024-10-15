import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class sentence_contexts extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    sentence_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'sentences',
        key: 'sentence_id'
      }
    },
    context_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'contexts',
        key: 'context_id'
      }
    }
  }, {
    sequelize,
    tableName: 'sentence_contexts',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "sentence_contexts_pkey",
        unique: true,
        fields: [
          { name: "sentence_id" },
          { name: "context_id" },
        ]
      },
    ]
  });
  }
}
