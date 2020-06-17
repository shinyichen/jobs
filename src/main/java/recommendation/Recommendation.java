package recommendation;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import db.MySQLConnection;
import entity.Item;
import external.GitHubClient;

public class Recommendation {
  
  public List<Item> recommendItems(String userId, double lat, double lon) {
    List<Item> recommendedItems = new ArrayList<>();
    MySQLConnection connection = new MySQLConnection();
    Set<String> favoritedItemIds = connection.getFavoriteItemIds(userId);
    
    // get keyword count
    Map<String, Integer> allKeywords = new HashMap<>(); // keyword : count
    for (String itemId : favoritedItemIds) {
      // keywords for the item
      Set<String> keywords = connection.getKeywords(itemId);
      for (String keyword : keywords) {
        allKeywords.put(keyword, allKeywords.getOrDefault(keyword, 0) + 1);
      }
    }
    connection.close();
    
    // sort by keyword count, and only pick the top 3 keywords
    List<Entry<String, Integer>> keywordList = new ArrayList<>(allKeywords.entrySet());
    Collections.sort(keywordList,  (Entry<String, Integer> e1, Entry<String, Integer> e2) -> {
      return Integer.compare(e2.getValue(), e1.getValue());
    });
    
    if (keywordList.size() > 3) {
      keywordList = keywordList.subList(0,  3);
    }
    
    // don't recommend items user already favorited or already added
    Set<String> visitedItemIds = new HashSet<>();
    GitHubClient client = new GitHubClient();
    
    for (Entry<String, Integer> keyword : keywordList) {
      List<Item> items = client.search(lat,  lon,  keyword.getKey());
      for (Item item : items) {
        if (!favoritedItemIds.contains(item.getItemId()) && !visitedItemIds.contains(item.getItemId())) {
          recommendedItems.add(item);
          visitedItemIds.add(item.getItemId());
        }
      }
    }
    
    return recommendedItems;
  }

}
