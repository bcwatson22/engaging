import { gql } from "urql";

import { iconSize as singleDensityIconSize } from "@/components/molecules/Technology/Technology";
import { imageSize as singleDensityImageSize } from "@/components/organisms/Mugshot/Mugshot";

import { multiplyToString } from "@/utils/multiplyToString";

const imageSize = multiplyToString(singleDensityImageSize);
const iconSize = multiplyToString(singleDensityIconSize);

export const queryHome = gql`
  query Home {
    homes(first: 1) {
      id
      title
      description
      keywords
      mugshot {
        id
        image {
          id
          url(
            transformation: {
              image: { resize: { width: ${imageSize}, height: ${imageSize}, fit: scale } }
              document: { output: { format: webp } }
            }
          )
        }
        heading
        description
        links {
          id
          text
          target
          icon
        }
      }
      technologies(first: 12) {
        id
        name
        link {
          id
        }
        icon {
          id
          url(
            transformation: {
              image: { resize: { width: ${iconSize}, fit: scale } }
              document: { output: { format: webp } }
            }
          )
        }
      }
    }
  }
`;
