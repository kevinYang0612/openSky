import Debug "mo:base/Debug";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Text "mo:base/Text";


/**
content is the actual image data, we are going to store as an array of eight bit natural number
*/
actor class NFT (name: Text, owner: Principal, content: [Nat8]) = this
{
    private let itemName = name;
    private var nftOwner = owner;
    private let imageBytes = content;
    private var listedForSale = false;

    public query func getName() : async Text
    {
        return itemName;
    };
    public query func getOwner() : async Principal
    {
        return nftOwner;
    };
    public query func getAsset() : async [Nat8]
    {
        return imageBytes;
    };
    // Get the Principal identifier of an actor, Principal.fromActor()
    public query func getCanisterId() : async Principal
    {
        return Principal.fromActor(this);
    };

    // transfer the listing item to the platform, platform holds on to it until someone buys it
    // transfer() is being called by the owner of the NFT owner
    public shared(msg) func transferOwnership(newOwner: Principal) : async Text
    {
        // if (isListing)
        // {
        //     listedForSale := true;
        // }
        // else 
        // {
        //     listedForSale := false;
        // };
        if (msg.caller == nftOwner)
        {
            nftOwner := newOwner;
            return "Success";
        }
        else 
        {
            return "Error: Not initiated by NFT Owner";
        }
    };


};