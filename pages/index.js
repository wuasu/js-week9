import { apiPath, token } from "./config.js";

const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
let productData = [];
let cartData = [];

function init() {
  getProductList();
  getCartList();
}
init();

// 取得產品列表
function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products`
    )
    .then((res) => {
      productData = res.data.products;
      randerProductList();
    })
    .catch((err) => {
      console.log(err.message);
    });
}

function generateProductCard(item) {
  return `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src="${item.images}"
          alt="">
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">
        NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
      </li> `;
}

function randerProductList() {
  let str = "";
  productData.forEach((item) => {
    str += generateProductCard(item);
  });
  productList.innerHTML = str;
}

productSelect.addEventListener("change", (e) => {
  const category = e.target.value;
  if (category === "全部") {
    randerProductList;
    return;
  }
  let str = "";
  productData.forEach((item) => {
    if (item.category === category) {
      str += generateProductCard(item);
    }
    productList.innerHTML = str;
  });
});

productList.addEventListener("click", (e) => {
  e.preventDefault();

  let addCardClass = e.target.getAttribute("class");
  if (addCardClass !== "addCardBtn") {
    return;
  }
  let productId = e.target.getAttribute("data-id");
  // console.log(productId);
  let numCheck = 1;
  cartData.forEach((item) => {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  });

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`,
      {
        data: {
          productId: productId,
          quantity: numCheck,
        },
      }
    )
    .then((res) => {
      alert("加入購物車");
      getCartList();
    });
});

//取得購物車清單
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`
    )
    .then((res) => {
      //總金額
      document.querySelector(".js-total").textContent = res.data.finalTotal;
      let str = "";
      cartData = res.data.carts;
      cartData.forEach((item) => {
        str += `
          <tr>
            <td>
              <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
              </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT$${item.product.price * item.quantity}</td>
            <td class="discardBtn">
              <a href="#" class="material-icons" data-cartId="${item.id}" 
                 data-product="${item.product.title}">
                clear
              </a>
            </td>
          </tr>   
        `;
      });

      cartList.innerHTML = str;
    });
}
getCartList();

//刪除單一商品
cartList.addEventListener("click", (e) => {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-cartId");
  const productName = e.target.getAttribute("data-product");

  if (cartId == null) {
    return;
  }

  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${cartId}`
    )
    .then((res) => {
      alert(`刪除[${productName}]成功`);
      getCartList();
    });
});

// 刪除全部購物車
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`
    )
    .then((res) => {
      getCartList();
      alert("已清空購物車");
    })
    .catch((err) => {
      alert("購物車是空的");
    });
});

//送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;

  if (cartData.length == 0) {
    alert("購物車是空的喔");
    return;
  }
  if (
    customerName == "" ||
    customerPhone == "" ||
    customerEmail == "" ||
    customerAddress == "" ||
    tradeWay == ""
  ) {
    alert("預訂資料皆為必填");
    return;
  }

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`,
      {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: tradeWay,
          },
        },
      }
    )
    .then((res) => {
      alert("訂單建立成功");
      document.querySelector("#customerName").value = "";
      document.querySelector("#customerPhone").value = "";
      document.querySelector("#customerEmail").value = "";
      document.querySelector("#customerAddress").value = "";
      document.querySelector("#tradeWay").value = "ATM";
      getCartList();
    })
    .catch((err) => {
      alert("訂單建立失敗");
    });
});
