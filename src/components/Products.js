import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Cart, { generateCartItemsFrom } from "./Cart";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
import "./Products.css";


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [timerId, setTimerId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const token = localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    try {
      let response = await axios.get(`${config.endpoint}/products`);
      console.log(response.data);
      return response.data
    } catch (e) {
      return [];
    }
  };


  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      let response = await axios.get(`${config.endpoint}/products/search?value=${text}`);
      return response.data;
    } catch (e) {
      return [];
    }
  }

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    let timerId = setTimeout(()=>{
      performSearch(event.target.value)
          .then(data => {
            setProducts(data);
          })
    },500)
    setTimerId(timerId);
  }

  useEffect(() => {
    return () => {
      clearTimeout(timerId)
    }
  }, [timerId]);

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
   useEffect(() => {
    const onLoadfetchData = async () => {
      const productData = await performAPICall();
      const cartData = await fetchCart(token);
      const cartItemsData =  generateCartItemsFrom(cartData, productData);
      setLoading(false);
      setProducts(productData);
      setCartItems(cartItemsData);
      console.log("Product Data", productData);
      console.log("Cart Item Data", cartItemsData);
    }
    onLoadfetchData();

  }, []);



  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      let response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      console.log("CartData", response.data);
      return response.data

    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error"
          }
        );
      }
      return null;
    }
  }

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    const foundItem = items.find((item) =>  item.productId === productId);
    return !!foundItem;
  } 
  
  const updateCartItems = (items, products) => { 
    const newCartItems = generateCartItemsFrom(items, products);
  setCartItems(newCartItems);
  }
  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    
    try {

      if(!token){
        enqueueSnackbar("Login to add an item to the Cart", { variant: "warning"});
        return;
      }

      if(options.preventDuplicate && isItemInCart(items, productId)){
        enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: "warning" });
        return;
      }
    
    
      const response = await axios.post(`${config.endpoint}/cart`,
      {
        productId, qty
      }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("CartClick > ", response.data);

      updateCartItems(response.data, products)
      return response.data
      
    } catch (err) {
      console.log(err.message);
      enqueueSnackbar( "Could not Add/Update cart items. Check that the backend is running, reachable and returns valid JSON.",
      { variant: "error" });
      return;
    }
 
  }


  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
        className="search-desktop"
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => {
          debounceSearch(e, timerId);
        }}
      />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      {localStorage.getItem("token") ? (
          // Display for logged-in users
          <Grid container spacing={2} marginY={1} paddingX={1}>
            <Grid item md={8}>
              <Grid container>
                <Grid item className="product-grid">
                  <Box className="hero">
                    <p className="hero-heading">
                      India’s <span className="hero-highlight">FASTEST DELIVERY</span> to your doorstep
                    </p>
                  </Box>
                </Grid>
              </Grid>

              {loading ? (
                // Loading state
                <Box className="loading">
                  <CircularProgress />
                  <h4>Loading Products...</h4>
                </Box>
              ) : products.length ? (
                // Render product cards
                <Grid container spacing={2} marginY={1} paddingX={1}>
                  {products.map((product) => (
                    <Grid item xs={6} md={3} key={product._id}>
                      <ProductCard 
                        product={product}
                        handleAddToCart={async () => {
                          await addToCart(
                            token, 
                            cartItems,
                            products,
                            product._id,
                            1,
                            { 
                              preventDuplicate: true 
                            }
                          );
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // No products found
                <Box className="loading">
                  <SentimentDissatisfied />
                  <h4>No Products Found.</h4>
                </Box>
              )}
            </Grid>

            {/* Display cart for logged-in users */}
            <Grid item marginY={2} xs={12} md={4} bgcolor="#E9F5E1">
              <Cart 
                products={products} 
                items={cartItems} 
                handleQuantity={addToCart}
                hasCheckoutButton={true}
              />
            </Grid>
          </Grid>
        ) : (
          // Display for users not logged in
          <Grid container>
            <Grid item className="product-grid">
              <Box className="hero">
                <p className="hero-heading">
                  India’s <span className="hero-highlight">FASTEST DELIVERY</span> to your doorstep
                </p>
              </Box>
            </Grid>

            {loading ? (
              // Loading state
              <Box className="loading">
                <CircularProgress />
                <h4>Loading Products...</h4>
              </Box>
            ) : products.length ? (
              // Render product cards
              <Grid container spacing={2} marginY={1} paddingX={1}>
                {products.map((product) => (
                  <Grid item xs={6} md={3} key={product._id}>
                    <ProductCard 
                      product={product}
                      handleAddToCart={async () => {
                        await addToCart(
                          token, 
                          cartItems,
                          products,
                          product._id,
                          1,
                          { 
                            preventDuplicate: true 
                          }
                        );
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              // No products found
              <Box className="loading">
                <SentimentDissatisfied />
                <h4>No Products Found.</h4>
              </Box>
            )}
          </Grid>
        )}
      <Footer />
    </div>
  );
}

export default Products;
