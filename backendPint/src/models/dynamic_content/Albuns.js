module.exports = (sequelize, DataTypes) => {
    const Albuns = sequelize.define('Albuns', {
        album_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        event_id: { type: DataTypes.INTEGER, allowNull: true },
        sub_area_id: { type: DataTypes.INTEGER, allowNull: true },
        area_id: { type: DataTypes.INTEGER, allowNull: true },
        creation_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
        title: { type: DataTypes.STRING(255), allowNull: false }
    }, {
        schema: 'dynamic_content',
        tableName: 'albuns',
        timestamps: false
    });

    Albuns.associate = function(models) {
        Albuns.belongsTo(models.Events, { foreignKey: 'event_id', targetKey: 'event_id', schema: 'dynamic_content', onDelete: 'CASCADE' });
        Albuns.belongsTo(models.SubArea, { foreignKey: 'sub_area_id', targetKey: 'sub_area_id', schema: 'static_content' });
    };

    return Albuns;
};
