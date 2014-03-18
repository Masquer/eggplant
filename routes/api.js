exports.comers = function(req, res) {
  var id = 1; //CAST(foto AS CHAR(10000) CHARACTER SET utf8)
  var sql = "SELECT idJournal, event, edate, fio, foto FROM journal " +
    "INNER JOIN workers ON workers.idWorker = journal.worker " +
    "WHERE event=2 ORDER BY edate DESC, idJournal DESC LIMIT 10";
  sequelize
    .query(sql, null, { raw: true }, [ id ])
    .success(function(result) {
      res.json(result);
    });
};

exports.leavers = function(req, res) {
  var id = 1;
  var sql = "SELECT idJournal, event, edate, fio, foto FROM journal " +
    "INNER JOIN workers ON workers.idWorker = journal.worker " +
    "WHERE event=3 ORDER BY edate DESC, idJournal DESC LIMIT 10";
  sequelize
    .query(sql, null, { raw: true }, [ id ])
    .success(function(result) {
      res.json(result);
    });
};

exports.makeTimestamp = function(dateObj) {
  var date = new Date(dateObj);
  var yyyy = date.getFullYear();
  var mm = date.getMonth() + 1;
  var dd = date.getDate();
  var hh = date.getHours();
  var min = date.getMinutes();
  var ss = date.getSeconds();
  var mysqlDateTime = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min + ':' + ss;
  return mysqlDateTime;
}