// 外部 node_modules 資源
import { useEffect, useState } from "react";
import axios from "axios";

// 內部 src 資源
// import './App.css'


// 環境變數
// const { VITE_BASE_URL, VITE_API_PATH} = import.meta.env;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  
  const [tempProduct, setTempProduct] = useState({});
  const [products, setProducts] = useState([]);
  const [mainImage, setMainImage] = useState(null);

  const [isAuth, setIsAuth] = useState(false);
  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example"
  })

  const handleInputChange = (e) => {
    console.log(e.target.value);
    const {name, value} = e.target;
    setAccount({
      ...account,
      [name]: value,
    })
  }

  const signIn = async (e) => {
    e.preventDefault();
    // console.log(account);
    // console.log(VITE_BASE_URL);
    // console.log(VITE_API_PATH);
    
    try {
      const response = await axios.post(`${BASE_URL}/admin/signin`, account);
      const {expired, token} = response.data;
      setIsAuth(true);
      document.cookie =
      `hexToken=${token}; expires=${new Date(expired)}; SameSite=None; Secure`;
      // console.log(response);
      // console.log(expired, token);
      axios.defaults.headers.common['Authorization'] = `${token}`;
      getProducts();
      
    } catch (error) {
      console.dir(error);
      alert(`登入失敗: ${error.response.data.error.message}`);
    }
  };

  const getProducts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/${API_PATH}/admin/products`);
      console.log(response);
      setProducts(response.data.products)
      
    } catch(error) {
      console.dir(error);
      alert(`取得產品失敗: ${error.response.data.message}`)
    }
  }

  const checkLogin = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      // console.log(token);
      axios.defaults.headers.common['Authorization'] = token;
      const response = await axios.post(`${BASE_URL}/api/user/check`);
      console.log(response);
      alert(`使用者已登入`);
      
    } catch(error){
      console.dir(error);
      alert(error.response.data.message)
    }
  }

  // 使用 useEffect 監聽 tempProduct 的變化
  useEffect(() => {
    if(tempProduct) {
      setMainImage(tempProduct.imageUrl) // 當 tempProduct 更新後執行
    }
  }, [tempProduct])

  return (
    <>
      {
        isAuth
        ? (
          <div className="container">
            <div className="row mt-5">
              <div className="col-md-6">
                <button type="button" className="btn btn-danger" onClick={checkLogin}>檢查使用者是否登入</button>
                <h2>產品列表</h2>
                <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    products.map(product => (
                      <tr key={ product.id }>
                        <td>{ product.title }</td>
                        <td>{ product.origin_price }</td>
                        <td>{ product.price }</td>
                        <td>{ product.is_enabled ? '啟用' : '不啟用' }</td>
                        <td>
                          <button type="button" className="btn btn-primary" onClick={() => setTempProduct(product)}>查看細節</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <h2>單一產品細節</h2>
                  <button type="button" className="btn btn-primary ms-2 mb-2" onClick={() => setTempProduct({})}>重置</button>
                </div>
                {
                  tempProduct.title ?
                    ( <div className="card">
                      <img src={mainImage || tempProduct.imageUrl} className="card-img-top object-fit-contain main-image" alt="main image" />
                      <div className="card-body">
                        <h5 className="card-title d-flex align-items-center">
                          { tempProduct.title }
                          <span className="badge text-bg-primary ms-2">{ tempProduct.category }</span>
                        </h5>
                        
                        <p className="card-text">商品描述：<br />{ tempProduct.description }</p>
                        <p className="card-text">Allergens：{ tempProduct.content.allergens }</p>
                        <p className="card-text">Ingredient：{ tempProduct.content.ingredients }</p>
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th scope="col"></th>
                              <th scope="col">Per 100g</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tempProduct.content.nutritionalInfo.map((item, index) => (
                              <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="card-text">£{ tempProduct.price } / <del className="text-secondary">{ tempProduct.origin_price } </del></p>
                        <h5>更多圖片：</h5>
                        <div className="d-flex flex-wrap gap-3">
                          {
                            tempProduct.imagesUrl?.map((url, index) => (
                              <img className={`more-images ${mainImage === url ? 'active' : ''}`} key={index}  src={url} alt="main image" onClick={() => setMainImage(url)}/>
                            ))
                          }
                        </div>
                      </div>
                    </div>) 
                    : (<p className="text-secondary">請選擇一個商品查看</p>)
                }
              </div>
            </div>

          </div>
        ) : (
          <div className="d-flex flex-column justify-content-center align-items-center vh-100">
            <h1 className="mb-5">
              請先登入 <i className="bi bi-box-arrow-in-left"></i>
            </h1>
            <form onSubmit={signIn} className="d-flex flex-column gap-3">
              <div className="form-floating mb-3">
                <input
                  name="username"
                  value={account.username}
                  onChange={handleInputChange}
                  type="email"
                  className="form-control"
                  id="username"
                  placeholder="name@example.com"
                />
                <label htmlFor="username">Email address</label>
              </div>
              <div className="form-floating">
                <input
                  name="password"
                  value={account.password}
                  onChange={handleInputChange}
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Password"
                />
                <label htmlFor="password">Password</label>
              </div>
              <button type="submit" className="btn btn-primary">
                登入
              </button>
            </form>
            <p className="mt-5 mb-3 text-secondary">&copy; 2024 - Regis's Cakes</p>
          </div>
        )
      }
      
    </>
  );
}

export default App;
