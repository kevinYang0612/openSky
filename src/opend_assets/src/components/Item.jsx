import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory} from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

/**
 * minted NFT to show up on our page
 * 
*/

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLabel, setPriceLabel] = useState();
  const [shouldDisplay, setDisplay] = useState(true);

  const id = (props.id).toText(); // access the canister and call the method of that canister

  const localHost = "http://localhost:8080/"; // use http to fetch that canister to internet computer blockchain
  
  // create new HTTP agent is going to make requests
  // agent is low-level interface that Actor uses to encode and decode messages to the internet computer
  const agent = new HttpAgent({host: localHost});
  agent.fetchRootKey();

  let NFTActor;

  // use agent to fetch name, owner, image
  async function loadNFT() 
  {
      // agent get hold of NFT canister
      // IDL Factory in declarations/nft, it gives our frontend a tranlated version of our Motoko backend
      // our JavaScript will knopw which method can be called in our NFT canister
      // 1st param: interfaceFactory
      // 2nd param: configuration
      NFTActor = await Actor.createActor(idlFactory, 
        {
            agent, canisterId: id,
        });

        const name = await NFTActor.getName();
        const owner = await NFTActor.getOwner();
        const imageData = await NFTActor.getAsset();

        const imageContent = new Uint8Array(imageData);
        const image = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png"}));

        
        setName(name);
        setOwner(owner.toText());
        setImage(image);

        // setting up my NFTs page
        if (props.role === "collection")
        {
            // check if the item is listed for sale or not, in backend, 
            // if HashMap mapOfListings can't find it, means not for sale
            const nftIsListed = await opend.isListed(props.id);
            if (nftIsListed) 
            {
                setOwner("openD");
                setBlur({filter: "blur(6px)"});
                setSellStatus("Listed");
            }
            else 
            {
                setButton(<Button handleClick = {handleSell} text = {"Sell"}/>);
            }
        }
        // setting up discover page (list NFTs for sale)
        else if (props.role === "discover")
        {
            const originalOwner = await opend.getOriginalOwner(props.id);

            // original owner should not be seeing buy button
            if (originalOwner.toText() != CURRENT_USER_ID.toText())
            {
                setButton(<Button handleClick = {handleBuy} text = {"Buy"}/>);
            }
            const price = await opend.getListedNFTPrice(props.id);
            setPriceLabel(<PriceLabel sellPrice = {price.toString()}/>)
        }
  }

  // second param is monitoring to see how many times the function in useEffect method, 
  // leave empty to call first time
  // first param is the setup function
  useEffect( () => 
  {
      loadNFT();
  }, []);

  let price;

  /*
    handleSell creates a price input element, allows user to enter a price when selling
   */
  function handleSell()
  {
      console.log("Sell clicked");
      // price input
      setPriceInput(<input
                    placeholder="Price in DHusky"
                    type="number"
                    className="price-input"
                    value={price}
                    onChange={e => {price = e.target.value; }}
                    />);
      // once in sell, we need to handle sellItem
      setButton(<Button handleClick = {sellItem} text = {"Confirm"}/>);
  }
  async function sellItem()
  {
      setBlur({filter: "blur(6px)"});
      setLoaderHidden(false);
      console.log(price);
      const listingResult = await opend.listItem(props.id, Number(price));
      console.log("listing: " + listingResult);
      if (listingResult == "Success")
      {
          // platform opend id
          const openDId = await opend.getOpenDCanisterID();
          // transfer to new owner, which is opend platform
          const transferResult = await NFTActor.transferOwnership(openDId);
          console.log("Transfer: " + transferResult);
          if (transferResult == "Success")
          {
              setLoaderHidden(true);
              setButton();
              setPriceInput();
              setOwner("OpenD");
              setSellStatus("Listed");
          }
      }
  }
  async function handleBuy()
  {
      console.log("Buy was triggered");
      setLoaderHidden(false);
      const tokenActor = await Actor.createActor(tokenIdlFactory, {
        agent, canisterId: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
      });

      const sellerId = await opend.getOriginalOwner(props.id);
      const itemPrice = await opend.getListedNFTPrice(props.id);

      const result = await tokenActor.transfer(sellerId, itemPrice);
      if (result === "Success")
      {
          // Transfer the ownership
          const transferResult = await opend.completePurchase(props.id, sellerId, CURRENT_USER_ID);
          console.log("Purchase" + transferResult);
          setLoaderHidden(true);
          setDisplay(false);
      }
  }

  /*
      list this item in main canister, keep track of it somewhere in a HashMap,
      we will know which of these items are listed and how much listed for
   */

  return (
    <div style = {{display: shouldDisplay ? "inline" : "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
            <div hidden = {loaderHidden} className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
          </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
