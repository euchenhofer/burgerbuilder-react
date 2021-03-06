import React, { Component, Fragment } from 'react';

import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../components/hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders.js';

const INGREDIENT_PRICES = {
  'salad': .5,
  'cheese': .8,
  'meat': 2,
  'bacon': 1
};

class Burgerbuilder extends Component {

  state = {
    ingredients: {
      salad: 0,
      bacon: 0,
      cheese: 0,
      meat: 0
    },
    totalPrice: 4,
    purchasable: false,
    purchasing: false,
    loading: false
  }

  updatePurchaseState (ingredients) {
    const sum = Object.keys(ingredients)
      .map(igKey => {
        return ingredients[igKey];
      })
      .reduce((sum, el) => {
        return sum + el;
      }, 0);

    this.setState({ purchasable: sum > 0 });
  }

  addIngredientHandler = (type) => {
    const oldCount = this.state.ingredients[type]
    const updatedCount = oldCount + 1;
    const updatedIngredients = {
      ...this.state.ingredients
    };
    updatedIngredients[type] = updatedCount;
    const priceAddition = INGREDIENT_PRICES[type];
    const oldPrice = this.state.totalPrice;
    const newPrice = oldPrice + priceAddition;

    this.setState({
      ingredients: updatedIngredients,
      totalPrice: newPrice
    });

    this.updatePurchaseState(updatedIngredients);
  }

  removeIngredientHandler = (type) => {
    const oldCount = this.state.ingredients[type]

    if (oldCount <= 0) { return; }

    const updatedCount = oldCount - 1;
    const updatedIngredients = {
      ...this.state.ingredients
    };
    updatedIngredients[type] = updatedCount;
    const priceDeduction = INGREDIENT_PRICES[type];
    const oldPrice = this.state.totalPrice;
    const newPrice = oldPrice - priceDeduction;

    this.setState({
      ingredients: updatedIngredients,
      totalPrice: newPrice
    });

    this.updatePurchaseState(updatedIngredients);
  }

  purchaseHandler = () => {
    this.setState({ purchasing: true });
  }

  purchaseCancelHandler = () => {
    this.setState({ purchasing: false })
      .then(response => { console.log(response) })
      .catch(error => { console.log(error) });
  }

  purchaseContinueHandler = () => {
    this.setState({ loading: true });
    const order = {
      ingredients: this.state.ingredients,
      price: this.state.totalPrice,
      customer: {
        name: 'Stefan',
        address: {
          street: 'Sägackerweg 3',
          zip: '79859',
          country: 'Germany'
        },
        email: 'testmail@stefan.de'
      },
      deliverymethod: 'fast'
    }

    axios.post('/orders.json', order)
      .then(response => {
        this.setState({ loading: false, purchasing: false });
      })
      .catch(error => {
        this.setState({ loading: false, purchasing: false });
      });
  }

  render () {
    const disabledInfo = {
      ...this.state.ingredients
    };
    for (let key in disabledInfo) {
      disabledInfo[key] = disabledInfo[key] <= 0;
    }
    let orderSummary = <OrderSummary
      ingredients={this.state.ingredients}
      cancelOrder={this.purchaseCancelHandler}
      orderTotal={this.state.totalPrice}
      continuePurchase={this.purchaseContinueHandler} />;
    if (this.state.loading) {
      orderSummary = <Spinner />;
    }
    return (
      <Fragment>
        <Burger ingredients={this.state.ingredients}/>
        <Modal show={this.state.purchasing} hideModal={this.purchaseCancelHandler}>
          {orderSummary}
        </Modal>
        <BuildControls
          addIngredient={this.addIngredientHandler}
          removeIngredient={this.removeIngredientHandler}
          disabled={disabledInfo}
          currentPrice={this.state.totalPrice}
          purchasable={this.state.purchasable}
          makePurchase={this.purchaseHandler}
        />
      </Fragment>
    );
  }
}

export default withErrorHandler( Burgerbuilder, axios );
