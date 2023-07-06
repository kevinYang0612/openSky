import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import Item from "./Item";
import Minter from "./Minter";

function App() {

// const NFTID = "rrkah-fqaaa-aaaaa-aaaaq-cai"; // this is nft canister's id

  return (
    <div className="App">
      <Header />
      {/* <Item id = {NFTID}/> */}
      <Footer />
    </div>
  );
}

export default App;
