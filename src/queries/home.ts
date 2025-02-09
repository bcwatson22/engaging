import { gql } from "urql";

import { mugshotDimensions, techIconDimensions } from "@/constants/dimensions";

import { multiplyToString } from "@/utils/multiplyToString";

const mugshotWidth = multiplyToString(mugshotDimensions.width);
const techIconWidth = multiplyToString(techIconDimensions.width);

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
              image: { resize: { width: ${mugshotWidth}, fit: scale } }
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
              image: { resize: { width: ${techIconWidth}, fit: scale } }
              document: { output: { format: webp } }
            }
          )
        }
      }
    }
  }
`;
