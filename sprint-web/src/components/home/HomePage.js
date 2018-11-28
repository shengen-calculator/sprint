import React, {Component} from 'react';
import SearchForm from './SearchForm';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import ProductList from './ProductList';
import GroupedProductList from './GroupedProductList';
import * as productAction from '../../actions/productActions';

class HomePage extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            errors: {},
            searching: false,
            redirectToReferrer: false,
            condition: ''
        };
        this.search = this.search.bind(this);
        this.select = this.select.bind(this);
        this.updateCondition = this.updateCondition.bind(this);

    }

    componentWillMount() {
        if (this.props.match.params.numb) {
            this.setState({condition: this.props.match.params.numb});
            if (this.props.match.params.brand) {
                this.props.actions.productRequst({
                    number: this.props.match.params.numb,
                    brand: this.props.match.params.brand
                })
            } else {
                this.props.actions.productRequst({
                    number: this.props.match.params.numb
                })
            }

        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.numb !== nextProps.match.params.numb ||
            this.props.match.params.brand !== nextProps.match.params.brand) {
            this.setState({condition: nextProps.match.params.numb});
            if (nextProps.match.params.brand) {
                this.props.actions.productRequst({
                    number: nextProps.match.params.numb,
                    brand: nextProps.match.params.brand
                })
            } else {
                if (this.props.match.params.numb !== nextProps.match.params.numb) {
                    this.props.actions.productRequst({
                        number: nextProps.match.params.numb
                    })
                }
            }
        }
    }

    updateCondition(event) {
        return this.setState({condition: event.target.value});
    }

    search(event) {
        event.preventDefault();
        if (!this.searchFormIsValid()) {
            return;
        }

        this.props.history.push(`/search/${this.state.condition}`);
    };

    select(event) {
        const selected = this.props.products.items.filter(x =>
            x.id === event.target.parentNode.id)[0];
        this.props.history.push(`/search/${selected.shortNumber}/${selected.brand}`);
    }

    searchFormIsValid() {
        let formIsValid = true;
        let errors = {};

        if (this.state.condition.length < 3) {
            errors.condition = 'must contain at least 3 characters';
            formIsValid = false;
        }
        this.setState({errors: errors});
        return formIsValid;
    }

    render() {
        return (
            <div>
                <SearchForm
                    condition={this.state.condition}
                    errors={this.state.errors}
                    searching={this.props.products.loading}
                    onSearch={this.search}
                    onChange={this.updateCondition}
                />
                {(this.props.products.type === 1) && <ProductList
                    products={this.props.products.items}/>}
                {(this.props.products.type === 0) && <GroupedProductList
                    onSelect={this.select} products={this.props.products.items}/>}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        products: state.products
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(productAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);