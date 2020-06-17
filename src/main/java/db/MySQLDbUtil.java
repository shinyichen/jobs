package db;

public class MySQLDbUtil {
  private static final String INSTANCE = "lai-database.cayad2h7wcz6.us-east-2.rds.amazonaws.com";
  private static final String PORT_NUM = "3306";
  public static final String DB_NAME = "JobsDatabase";
  private static final String USERNAME = "admin";
  private static final String PASSWORD = "laidbadmin";
  public static final String URL = "jdbc:mysql://"
      + INSTANCE + ":" + PORT_NUM + "/" + DB_NAME
      + "?user=" + USERNAME + "&password=" + PASSWORD
      + "&autoReconnect=true&serverTimezone=UTC";

}
