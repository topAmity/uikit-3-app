import { AmityUiKitProvider, AmityUiKitSocial } from "@amityco/ui-kit";
import { useEffect, useState } from "react";
import { HashLoader } from "react-spinners";
import './App.css'

const userId = "topAmity";
const apiKey = "b3babb0b3a89f4341d31dc1a01091edcd70f8de7b23d697f";

const REACT_APP_API_KEY_GAMING = "b0e9be093adfa562183f8a4a5301168fd15dd8b0ec376c2f"
const REACT_APP_API_KEY_SPORT = "b0e9be093adef336183f8a4a53014088d15ad8b0ec3d3924"
const REACT_APP_API_KEY_FITNESS = "b0e9be093adef2641f35894f5b0f158bd50f84e2ee613e24"
const REACT_APP_API_KEY_FINANCIAL = "b0e9be093adef06c48378a4f520a128ad90888e5e9313928"
const REACT_APP_API_KEY_TRAVEL = "b0e9be093adef66d4c3f8c1d065b408e840bdde2e8666f79"
const REACT_APP_API_KEY_DEFAULT = "b3babb0b3a89f4341d31dc1a01091edcd70f8de7b23d697f"
const REACT_APP_API_KEY_AUTOMOTIVE = "b0eae80c32dba4611e378b14505b1189d05b89b7bc676724"

export default function App() {

  const [uikitApiKey, setUIKitApiKey] = useState<string>()
  const [loading, setLoading] = useState<boolean>(true);
  const [primary, setPrimary] = useState<string>('#06be8b')

    console.log('Welcome to ASC Web V3')
  const chooseCategoryApiKey = (category: string) => {
    switch (category) {
      case "travel":
        setUIKitApiKey(REACT_APP_API_KEY_TRAVEL);
        break;
      case "financial":
        setUIKitApiKey(REACT_APP_API_KEY_FINANCIAL);
        break;

      case "fitness":
        setUIKitApiKey(REACT_APP_API_KEY_FITNESS);
        break;

      case "sport":
        setUIKitApiKey(REACT_APP_API_KEY_SPORT);
        break;
      case "gaming":
        setUIKitApiKey(REACT_APP_API_KEY_GAMING);
        break;
      case "automotive":
        setUIKitApiKey(REACT_APP_API_KEY_AUTOMOTIVE);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const primary = urlParams.get("primary");
    const userId = urlParams.get("userId");
    const category = urlParams.get("category");

    if (category) {
      chooseCategoryApiKey(category);
    }
    if (primary) setPrimary("#" + primary)


  }, [])

  const autoJoinUser = async () => {
    try {
      const response = await fetch("https://apix.eu.amity.co/api/v4/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": uikitApiKey as string,
        },
        body: JSON.stringify({ userId: userId, deviceId: userId }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const { accessToken } = await response.json();
      if (accessToken) queryCommunities(accessToken);
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const queryCommunities = async (accessToken: string) => {
    try {
      const response = await fetch(
        "https://apix.eu.amity.co/api/v3/communities?isDeleted=false&filter=member",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );


      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const myCommunitites = await response.json();
      console.log('myCommunitites: ', myCommunitites);
      if(myCommunitites.communities.length>0){
        setLoading(false);
        console.log('not call join')
      }else{
        console.log('not call join')
        const response = await fetch(
          "https://apix.eu.amity.co/api/v3/communities?isDeleted=false",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const data = await response.json();
        const communityIds = data.communities.map(
          (item: { communityId: string }) => item.communityId
        );
        const joinPromises = communityIds.map((communityId: string) =>
          joinUserToCommunity(communityId, accessToken)
        );
  
        const results = await Promise.all(joinPromises);
        if (results.length > 0) {
          setTimeout(() => {
            setLoading(false);
          }, 200);
  
        }
      }
   
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const joinUserToCommunity = async (
    communityId: string,
    accessToken: string
  ) => {
    try {
      const response = await fetch(
        `https://apix.eu.amity.co/api/v3/communities/${communityId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data) return true;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (uikitApiKey) autoJoinUser();
  }, [uikitApiKey]);
  return (


        <AmityUiKitProvider
          key={userId}
          apiKey={apiKey as string}
          userId={userId}
          displayName={userId}
          apiRegion="sg"
          theme={{ palette: { primary: primary } }}
        >
          <AmityUiKitSocial />
        </AmityUiKitProvider>




  );
}