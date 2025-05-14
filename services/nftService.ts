import { type Connection, PublicKey } from "@solana/web3.js"
import {
  Metaplex,
  walletAdapterIdentity,
  type Nft,
  type NftWithToken,
  type Sft,
  type SftWithToken,
} from "@metaplex-foundation/js"
import type { WalletContextState } from "@solana/wallet-adapter-react"

// NFT Collection address
export const GOLD_COLLECTION_ADDRESS = {
  devnet: "GoLDNFT111111111111111111111111111111111111",
  testnet: "GoLDNFT111111111111111111111111111111111111",
  "mainnet-beta": "GoLDNFT111111111111111111111111111111111111",
}

// Get all NFTs owned by a wallet
export async function getNftsForOwner(
  connection: Connection,
  walletPublicKey: PublicKey,
): Promise<(Nft | NftWithToken | Sft | SftWithToken)[]> {
  try {
    const metaplex = new Metaplex(connection)

    const nfts = await metaplex.nfts().findAllByOwner({ owner: walletPublicKey })

    return nfts
  } catch (error) {
    console.error("Error getting NFTs:", error)
    return []
  }
}

// Get NFTs from the GOLD collection owned by a wallet
export async function getGoldNftsForOwner(
  connection: Connection,
  walletPublicKey: PublicKey,
): Promise<(Nft | NftWithToken | Sft | SftWithToken)[]> {
  try {
    const allNfts = await getNftsForOwner(connection, walletPublicKey)

    // Filter for NFTs from the GOLD collection
    // In a real implementation, you would check the collection address
    const goldNfts = allNfts.filter((nft) => {
      // Check if the NFT belongs to the GOLD collection
      // This is a simplified check - in production you would verify the collection address
      return (
        nft.collection?.address.toString() === GOLD_COLLECTION_ADDRESS.devnet ||
        nft.name.includes("GOLD") ||
        nft.symbol === "GOLD"
      )
    })

    return goldNfts
  } catch (error) {
    console.error("Error getting GOLD NFTs:", error)
    return []
  }
}

// Get a single NFT by mint address
export async function getNftByMint(
  connection: Connection,
  mintAddress: string,
): Promise<Nft | NftWithToken | Sft | SftWithToken | null> {
  try {
    const metaplex = new Metaplex(connection)
    const mint = new PublicKey(mintAddress)

    const nft = await metaplex.nfts().findByMint({ mintAddress: mint })

    return nft
  } catch (error) {
    console.error("Error getting NFT:", error)
    return null
  }
}

// List an NFT for sale
export async function listNftForSale(
  connection: Connection,
  wallet: WalletContextState,
  mintAddress: string,
  price: number,
): Promise<string> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    const metaplex = new Metaplex(connection)
    metaplex.use(walletAdapterIdentity(wallet))

    const mint = new PublicKey(mintAddress)

    // In a real implementation, you would use a marketplace program
    // This is a simplified example
    const listing = await metaplex.nfts().findByMint({ mintAddress: mint })

    // Return a mock transaction signature
    return "mock_listing_transaction_signature"
  } catch (error) {
    console.error("Error listing NFT for sale:", error)
    throw error
  }
}

// Buy an NFT
export async function buyNft(
  connection: Connection,
  wallet: WalletContextState,
  mintAddress: string,
  price: number,
): Promise<string> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    const metaplex = new Metaplex(connection)
    metaplex.use(walletAdapterIdentity(wallet))

    const mint = new PublicKey(mintAddress)

    // In a real implementation, you would use a marketplace program
    // This is a simplified example
    const nft = await metaplex.nfts().findByMint({ mintAddress: mint })

    // Return a mock transaction signature
    return "mock_purchase_transaction_signature"
  } catch (error) {
    console.error("Error buying NFT:", error)
    throw error
  }
}

// Mint a new NFT
export async function mintNft(
  connection: Connection,
  wallet: WalletContextState,
  name: string,
  description: string,
  imageUrl: string,
): Promise<string> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    const metaplex = new Metaplex(connection)
    metaplex.use(walletAdapterIdentity(wallet))

    // In a real implementation, you would upload the image to Arweave or IPFS
    // and create proper metadata

    const { nft } = await metaplex.nfts().create({
      name,
      uri: imageUrl,
      sellerFeeBasisPoints: 500, // 5%
    })

    return nft.address.toString()
  } catch (error) {
    console.error("Error minting NFT:", error)
    throw error
  }
}
