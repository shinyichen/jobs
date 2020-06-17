package external;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import entity.Item;
import entity.Item.ItemBuilder;

public class GitHubClient {
	private static final String URL_TEMPLATE = "https://jobs.github.com/positions.json?description=%s&lat=%s&long=%s";
	private static final String DEFAULT_KEYWORD = "developer";

	public List<Item> search(double lat, double lon, String keyword) {
		if (keyword == null) {
			keyword = DEFAULT_KEYWORD;
		}
		try {
			keyword = URLEncoder.encode(keyword, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		String url = String.format(URL_TEMPLATE, keyword, lat, lon);

		CloseableHttpClient httpclient = HttpClients.createDefault();

		// Create a custom response handler
		ResponseHandler<List<Item>> responseHandler = new ResponseHandler<List<Item>>() {

			@Override
			public List<Item> handleResponse(final HttpResponse response) throws IOException {
				if (response.getStatusLine().getStatusCode() != 200) {
					return new ArrayList<>();
				}
				HttpEntity entity = response.getEntity();
				if (entity == null) {
					return new ArrayList<>();
				}
				String responseBody = EntityUtils.toString(entity);
				return getItemList(new JSONArray(responseBody));
			}
		};

		try {
			return httpclient.execute(new HttpGet(url), responseHandler);
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return new ArrayList<>();

	}
	
	private List<Item> getItemList(JSONArray array) {
	  List<Item> itemList = new ArrayList<>();
	  List<String> descriptionList = new ArrayList<>();
	  
	  for (int i = 0; i < array.length(); i++) {
	    String description = getStringFieldOrEmpty(array.getJSONObject(i), "description");
	    if (description.equals("") || description.contentEquals("\n")) {
	      descriptionList.add(getStringFieldOrEmpty(array.getJSONObject(i), "title"));
	    } else {
	      descriptionList.add(description);
	    }
	  }
	  
	  List<List<String>> keywords = MonkeyLearnClient.extractKeywords(
	      descriptionList.toArray(new String[descriptionList.size()]));
	  
	  
	  for (int i = 0; i < array.length(); i++) {
	    JSONObject obj = array.getJSONObject(i);
	    
	    // JSONObject -> Item
	    ItemBuilder builder = new ItemBuilder();
	    builder.setItemId(getStringFieldOrEmpty(obj, "id"));
      builder.setName(getStringFieldOrEmpty(obj, "title"));
      builder.setAddress(getStringFieldOrEmpty(obj, "location"));
      builder.setUrl(getStringFieldOrEmpty(obj, "url"));
      builder.setImageUrl(getStringFieldOrEmpty(obj, "company_logo"));
      builder.setKeywords(new HashSet<String>(keywords.get(i)));
      
      Item item = builder.build();
      itemList.add(item);

	    
	  }
	  
	  return itemList;
	}
	
	private String getStringFieldOrEmpty(JSONObject obj, String key) {
	  return obj.isNull(key)? "" : obj.getString(key);
	}

}
