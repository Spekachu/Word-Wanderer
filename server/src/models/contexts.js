import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class contexts extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    context_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    context_description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'contexts',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "contexts_pkey",
        unique: true,
        fields: [
          { name: "context_id" },
        ]
      },
    ]
  });
  }
}
