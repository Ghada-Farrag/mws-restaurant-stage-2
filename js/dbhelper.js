/**
 * Common database helper functions.
 */



class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    //const port = 8000 // Change this to your server port
    //return `http://localhost:${port}/data/restaurants.json`;
    //return `http://localhost/data/restaurants.json`;
    //return `https://ghada-farrag.github.io/mws-restaurant-stage-1/data/restaurants.json`;
    return `http://localhost:${port}/restaurants`;

  }

  /**
  * Open IDB database.
  */
  static get dbPromise() {
    return DBHelper.openDatabase();
  }
  static openDatabase() {
    // If the browser doesn't support service worker, we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open('gh-RR-db', 2, function (upgradeDb) {
      const store1 = upgradeDb.createObjectStore('restaurantList', { keyPath: 'id' });
      //const store2 = upgradeDb.createObjectStore('conv_rates', { keyPath: 'id' });
    });
  }

  static storeRestaurants(restaurantList) {
    if (!restaurantList) {
      console.log('store in db failed:  list not defined.');
      return;
    }

    this.dbPromise.then(db => {
      if (!db) return;


      //store list in idb
      const tx = db.transaction('restaurantList', 'readwrite');
      const store = tx.objectStore('restaurantList');
      Object.keys(restaurantList).forEach(resturant => {
        store.put(restaurantList[resturant]);
      });

    }).catch(error => console.log('db error: ', error));
  }

  static getRestaurants() {
    this.dbPromise.then(db => {
      if (!db) return false;

      //read currencies from idb
      const tx = db.transaction('restaurantList');
      const store = tx.objectStore('restaurantList');
      store.getAll().then(restaurantList => {
        console.log('>>>Populating lists from idb ...', restaurantList);
        return restaurantList;
      }).catch(() => None);
    }).catch(error => {
      console.log('db error: ', error);
      return false;
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    //try to get from db first
    const restaurants = this.getRestaurants()
    if (restaurants) {
      console.log('>>>> retrieve from db: ', restaurants );
      callback(null, restaurants);
    } 
    else {
      console.log('>>>> retrieve online ................' );
      fetch(DBHelper.DATABASE_URL).then(response => response.json()).then(data => {
        if (data) { // Got a valid response from server!
          const restaurants = data;
          console.log('fetch response = ', data)
          DBHelper.storeRestaurants(restaurants);
          callback(null, restaurants);
        }
        else { // Oops!. Got an error from server.
          const error = ('Request failed.');
          callback(error, null);
        }
      });

    }
  }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }


  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  // Fetch all restaurants
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`./img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      })
    marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}
