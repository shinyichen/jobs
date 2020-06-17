package rpc;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONArray;
import org.json.JSONObject;

import db.MySQLConnection;
import entity.Item;
import external.GitHubClient;

/**
 * Servlet implementation class SearchItem
 */
public class SearchItem extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SearchItem() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
	  
	  HttpSession session = request.getSession(false);
    if (session == null) {
      response.setStatus(403);
      return;
    }
    
    String userId = request.getParameter("user_id");
    double lat = Double.parseDouble(request.getParameter("lat"));
    double lon = Double.parseDouble(request.getParameter("lon"));

    GitHubClient client = new GitHubClient();
    List<Item> items = client.search(lat, lon, null);

    // get user's favorite items from db
    MySQLConnection connection = new MySQLConnection();
    Set<String> favoritedItemIds = connection.getFavoriteItemIds(userId);
    connection.close();

    JSONArray array = new JSONArray();
    for (Item item : items) {
      JSONObject obj = item.toJSONObject();
      obj.put("favorite", favoritedItemIds.contains(item.getItemId()));
      array.put(obj);
    }
    RpcHelper.writeJsonArray(response, array);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
