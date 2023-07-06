import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { BrowserRouter, Link, Switch, Route} from "react-router-dom";
import homeImage from "../../assets/home-img.png";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";

function Header() {

  // useState hook to hold this gallery(user own's NFTs) component
  const [userOwnedGallery, setOwnedGallery] = useState();

  const [listingGallery, setListingGallery] = useState();

  async function getNFTs()
  {
      const userNFTIds = await opend.getOwnedNFTs(CURRENT_USER_ID);
      // pass the userNFTIds to gallery component to render all of those IDs
      // gallery is consisted of many Items
      setOwnedGallery(<Gallery title = "My NFTs" ids = {userNFTIds} role = "collection"/>);

      // grabbing all the listed NFT Ids
      const listedNFTIds = await opend.getListedNFTs();
      setListingGallery(<Gallery title = "Discover" ids = {listedNFTIds} role = "discover"/>);
  }

  /*
      What does useEffect do? By using this Hook, you tell React that 
      your component needs to do something after render. React will remember 
      the function you passed (we’ll refer to it as our “effect”), and call it later 
      after performing the DOM updates. In this effect, we set the document title, 
      but we could also perform data fetching or call some other imperative API. 
  */
  // trigger the getNFTs function the first time this component is rendered
  useEffect(()=>
  {
      getNFTs();
  }, [])

  return (
    <BrowserRouter forceRefresh = {true}>
          <div className="app-root-1">
      <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
        <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
          <div className="header-left-4"></div>
          <img className="header-logo-11" src={logo} />
          <div className="header-vertical-9"></div>
          <Link to = "/">
            <h5 className="Typography-root header-logo-text">OpenD</h5>
          </Link>
          <div className="header-empty-6"></div>
          <div className="header-space-8"></div>
          <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
          <Link to = "/discover">
            Discover
          </Link>
            
          </button>
          <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
          <Link to = "/minter">
            Minter
          </Link>
            
          </button>
          <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
            <Link to = "/collection">
              My NFTs
            </Link>
            
          </button>
        </div>
      </header>
    </div>
    <Switch>
      <Route exact path = "/">      
        <img className="bottom-space" src={homeImage} />
      </Route>
      <Route path = "/discover">
        {/* all NFTs for sale page */}
        {listingGallery}
      </Route>
      <Route path = "/minter">
        <Minter />
      </Route>
      <Route path = "/collection">
        {/* here is just a bunch items rendered here */}
        {userOwnedGallery}
      </Route>
    </Switch>
    </BrowserRouter>
  );
}

export default Header;
