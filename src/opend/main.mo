import Cycles "mo:base/ExperimentalCycles";

import Principal "mo:base/Principal";
// main backend, going to store these NFTs as a HashMap
import NFTActorClass "../NFT/nft";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Bool "mo:base/Bool";


actor OpenD 
{
    // new data type, customized, can have more property such as timedate and other details
    private type Listing = {
        itemOwner: Principal;
        itemPrice: Nat;
    };


    // each NFT principal is mapped to one single NFT
    var mapOfNFTs = HashMap.HashMap<Principal, 
                    NFTActorClass.NFT>(1, Principal.equal, Principal.hash);

    // each owner can own several NFTs                
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);

    // create a HashMap, keep track of all the listings
    // key is principal id of listed NFT, value is custom type
    // we want to hold a bunch of information
    var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

    // name of the image, return principal is the newly created canister
    public shared(msg) func mint(imgData: [Nat8], name: Text) : async Principal
    {   
        // access the identity of the user who called this method
        // getting called from frontend over onSumbit get triggered
        let owner : Principal = msg.caller;

        Debug.print(debug_show(Cycles.balance()));
        Cycles.add(1_500_000_000);
        let newNFT = await NFTActorClass.NFT(name, owner, imgData);
        Debug.print(debug_show(Cycles.balance()));  

        let newNFTPrincipal = await newNFT.getCanisterId();
        mapOfNFTs.put(newNFTPrincipal, newNFT);

        addToOwnershipMap(owner, newNFTPrincipal);


        return newNFTPrincipal;
    };

    // add newly created NFT to mapOfOwners
    private func addToOwnershipMap(owner: Principal, nftId: Principal)
    {
        // get hold of NFTs that the user currently owns
        // switch is used for when HashMap.get could be an empty
        // for example, someone just created an account does not have any NFTs yet
        var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(owner))
        {
            // either return an empty list when newly created
            case null List.nil<Principal>();

            // or return the result list
            case (?result) result;
        };
        // push nftid to the nft list
        ownedNFTs := List.push(nftId, ownedNFTs);

        // map the owner to its owned list NFTs
        mapOfOwners.put(owner, ownedNFTs);
    };

    // passed in an user principal id and return that owner's all NFTs as an array
    public query func getOwnedNFTs(user: Principal) : async [Principal]
    {
        var userNFTs : List.List<Principal> = switch (mapOfOwners.get(user))
        {
            case null List.nil<Principal>();
            case (?result) result;
        };

        return List.toArray(userNFTs);
    };
    // return all the listing NFTs ID
    public query func getListedNFTs() : async [Principal]
    {
        let ids = Iter.toArray(mapOfListings.keys());
        return ids;
    };

    // after create a HashMap, get hold of the item, the actual NFT from mapOfNFTs
    public shared(msg) func listItem(id: Principal, price: Nat) : async Text
    {
        var item: NFTActorClass.NFT = switch (mapOfNFTs.get(id))
        {
            case null return "NFT does not exist.";
            case (?res) res;
        };
        // get hold of the owner of this NFT we are pulling
        // not just everyone is going to call this method
        // we have to check the caller is the same person of the owner of the item
        let owner = await item.getOwner();
        if (Principal.equal(owner, msg.caller))
        {
            let newListing : Listing = 
            {
                itemOwner = owner;
                itemPrice = price;
            };
            // listing the items are going to sell, 
            // the id of the item and the newListing
            mapOfListings.put(id, newListing);
            return "Success";
        }
        else 
        {
            return "You don't own the NFT.";
        }
    };

    public query func getOpenDCanisterID() : async Principal 
    {
        return Principal.fromActor(OpenD);
    };

    /**
        to reflect either or not this(id) item is listed
    */
    public query func isListed(id: Principal) : async Bool
    {
        if (mapOfListings.get(id) == null)
        {
            return false;
        }
        else
        {
            return true;
        }
    };

    public query func getOriginalOwner(id: Principal) : async Principal
    {
        // pulling our Listing data type, which contents who listed info
        // pulling from the mapOfListings HashMap
        var listing : Listing = switch (mapOfListings.get(id))
        {
            case null return Principal.fromText("");
            case (?res) res;
        };
        // return Principal data type
        return listing.itemOwner;
    };

    public query func getListedNFTPrice(id: Principal) : async Nat
    {
        var listing: Listing = switch (mapOfListings.get(id))
        {
            case null return 0;
            case (?res) res;
        };
        return listing.itemPrice;
    };

    public shared(msg) func completePurchase(id: Principal, ownerId: Principal, newOwnerId: Principal) : async Text
    {
        var purchasedNFT : NFTActorClass.NFT = switch (mapOfNFTs.get(id))
        {
            case null return "NFT does not exist";
            case (?res) res;
        };
        let transferResult = await purchasedNFT.transferOwnership(newOwnerId);
        if (transferResult == "Success")
        {
            mapOfListings.delete(id);
            var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(ownerId))
            {
                case null List.nil<Principal>();
                case (?res) res;
            };
            ownedNFTs := List.filter(ownedNFTs, func (listItemId: Principal): Bool
            {
                return listItemId != id;
            });
            addToOwnershipMap(newOwnerId, id);
            return "Success";
        }
        else
        {
            return "Error";
        }

        
    };

};
