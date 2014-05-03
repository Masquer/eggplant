exports.comers = function(req, res) {
  var sql = "SELECT idJournal, event, edate, fio, foto FROM journal " +
    "INNER JOIN workers ON workers.idWorker = journal.worker " +
    "WHERE event=2 ORDER BY edate DESC, idJournal DESC LIMIT 10";
  sequelize
    .query(sql, null, { raw: true }, [])
    .success(function(result) {
      res.json(result);
    });
};

exports.leavers = function(req, res) {
  var sql = "SELECT idJournal, event, edate, fio, foto FROM journal " +
    "INNER JOIN workers ON workers.idWorker = journal.worker " +
    "WHERE event=3 ORDER BY edate DESC, idJournal DESC LIMIT 10";
  sequelize
    .query(sql, null, { raw: true }, [])
    .success(function(result) {
      res.json(result);
    });
};

exports.lastone = function(req, res) {
  var sql = "SELECT idJournal, event, edate, fio, foto FROM journal " +
    "INNER JOIN workers ON workers.idWorker = journal.worker " +
    "ORDER BY edate DESC, idJournal DESC LIMIT 1";
  sequelize
    .query(sql, null, { raw: true }, [])
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