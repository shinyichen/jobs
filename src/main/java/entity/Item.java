package entity;

import java.util.Set;

import org.json.JSONArray;
import org.json.JSONObject;

public class Item {

	private String itemId;
	private String name;
	private String address;
	private Set<String> keywords;
	private String imageUrl;
	private String url;
	
	//!! private, should use ItemBuilder.build()
	// hence Builder should be a inner static class (can access private constructor)
	// not using setter because once constructed, should not change
	private Item(ItemBuilder builder) { 
	  this.itemId = builder.itemId;
	  this.name = builder.name;
	  this.address = builder.address;
	  this.keywords = builder.keywords;
	  this.imageUrl = builder.imageUrl;
	  this.url = builder.url;
	}

	public String getItemId() {
		return itemId;
	}

	public String getName() {
		return name;
	}

	public String getAddress() {
		return address;
	}

	public Set<String> getKeywords() {
		return keywords;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public String getUrl() {
		return url;
	}
	
	public JSONObject toJSONObject() {
	  JSONObject obj = new JSONObject();
	  obj.put("item_id", itemId);
    obj.put("name", name);
    obj.put("address", address);
    obj.put("keywords", new JSONArray(keywords));
    obj.put("image_url", imageUrl);
    obj.put("url", url);
    return obj;
	}
	
	public static class ItemBuilder {

    private String itemId;
	  private String name;
	  private String address;
	  private Set<String> keywords;
	  private String imageUrl;
	  private String url;
	  
	  public ItemBuilder() {
	    
	  }
	  
	  public ItemBuilder setItemId(String itemId) {
      this.itemId = itemId;
      return this;
    }
    public ItemBuilder setName(String name) {
      this.name = name;
      return this;
    }
    public ItemBuilder setAddress(String address) {
      this.address = address;
      return this;
    }
    public ItemBuilder setKeywords(Set<String> keywords) {
      this.keywords = keywords;
      return this;
    }
    public ItemBuilder setImageUrl(String imageUrl) {
      this.imageUrl = imageUrl;
      return this;
    }
    public ItemBuilder setUrl(String url) {
      this.url = url;
      return this;
    }
    
    public Item build() {
      return new Item(this);
    }
	  
	}

}
