import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { opend } from "../../../declarations/opend";
import { Principal } from "@dfinity/principal";
import Item from "./Item";


/**
 * user create their own images instead of calling thru the command line 
 * 
*/

function Minter() {

  // use react form hook instead of value and onChange
  // 1st param is an object we can tap into, register all the input that user creates on our form
  // 2nd param is an action, a function, when the submit button get triggered
  const {register, handleSubmit} = useForm(); 
  const [nftPrincipal, setNFTPrincipal] = useState("");
  const [loaderHidden, setLoaderHidden] = useState(true);

  // the function actually handle the submitting
  async function onSubmit(data)
  {
      setLoaderHidden(false);
      const name = data.name;
      const image = data.image[0];
      // blob.arrayBuffer turn content of the blob as binary data, match [Nat8] data type
      const imageByteData = [...new Uint8Array(await image.arrayBuffer())];
      // canisterID of newNFT
      const newNFTID = await opend.mint(imageByteData, name);

      setNFTPrincipal(newNFTID);
      setLoaderHidden(true);
  }
  if (nftPrincipal === "")
  {
      return(
            <div className="minter-container">
            <div hidden = {loaderHidden} className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
            <h3 className="makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
              Create NFT
            </h3>
            <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
              Upload Image
            </h6>

            <form className="makeStyles-form-109" noValidate="" autoComplete="off">
              <div className="upload-container">
                <input
                  {...register("image", {required: true})}
                  className="upload"
                  type="file"
                  accept="image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp"
                />
              </div>
              <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
                Collection Name
              </h6>
              <div className="form-FormControl-root form-TextField-root form-FormControl-marginNormal form-FormControl-fullWidth">
                <div className="form-InputBase-root form-OutlinedInput-root form-InputBase-fullWidth form-InputBase-formControl">
                  <input
                    // register our input, all object are already registered
                    // spread object
                    {...register("name", {required: true})}
                    placeholder="e.g. CryptoDunks"
                    type="text"
                    className="form-InputBase-input form-OutlinedInput-input"
                    
                  />
                  <fieldset className="PrivateNotchedOutline-root-60 form-OutlinedInput-notchedOutline"></fieldset>
                </div>
              </div>
              <div className="form-ButtonBase-root form-Chip-root makeStyles-chipBlue-108 form-Chip-clickable">
                {/* onClick is acting the submit button */}
                <span onClick = {handleSubmit(onSubmit)} className="form-Chip-label">Mint NFT</span>
              </div>
            </form>
          </div>
      );

  }
  else 
  {
      return(
          <div className="minter-container">
          <h3 className="Typography-root makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
            Minted!
          </h3>
          <div className="horizontal-center">
            <Item id = {nftPrincipal}/>
          </div>
          </div>
      );

  }

}

export default Minter;
