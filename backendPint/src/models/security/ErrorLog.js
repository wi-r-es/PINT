module.exports = (sequelize, DataTypes) => {
    const ErrorLog = sequelize.define('ErrorLog', {
        error_log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        error_message: { type: DataTypes.STRING(4000), allowNull: false },
        error_severity: { type: DataTypes.STRING(255), allowNull: false },
        error_state: { type: DataTypes.STRING(255), allowNull: false },
        error_time: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
        schema: 'security',
        tableName: 'error_log',
        timestamps: false
    });
    return ErrorLog;
};
