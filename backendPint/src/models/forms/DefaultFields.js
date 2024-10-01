module.exports = (sequelize, DataTypes) => {
    const DefaultFields = sequelize.define('DefaultFields', {
        field_id: { type: DataTypes.INTEGER, primaryKey: true },
        field_name: { type: DataTypes.STRING(60), allowNull: false },
        field_type: { type: DataTypes.STRING(255), allowNull: false },
        field_value: { type: DataTypes.TEXT, allowNull: false },
        max_value: { type: DataTypes.INTEGER, allowNull: true },
        min_value: { type: DataTypes.INTEGER, allowNull: true }
    }, {
        schema: 'forms',
        tableName: 'default_fields',
        timestamps: false
    });

    return DefaultFields;
};
