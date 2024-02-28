import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";


const ProductCard = ({ product, handleAddToCart }) => {

  return (
    <Card className="card">
      <CardMedia component='img' image={product.image} />
      <CardContent>
          <Typography>{product.name}</Typography>
          <Typography paddingY={1} fontwidth="700">${product.cost}</Typography>
          <Rating 
            value={product.rating}
            precision={0.5}
            readOnly
          />
      </CardContent>
      <CardActions>
        <Button 
          fullWidth
          variant="contained" 
          startIcon={<AddShoppingCartOutlined/>}
          onClick={handleAddToCart}
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
