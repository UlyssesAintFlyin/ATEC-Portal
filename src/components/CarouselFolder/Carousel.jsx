import React from 'react'
import Carousel from 'react-material-ui-carousel'
import Item from './Item'

function CarouselComponent() {
  const items = [
    {
      name: "Random Name #1",
      description: "Probably the most random thing you have ever seen!",
      image: "/resources/caruos.jpg"
    },
    {
      name: "Random Name #2",
      description: "Hello World!",
      image: "/resources/image1.jpg"
    },
    {
      name: "Random Name #3",
      description: "Hello World!"
    }
  ]

  return (
    <Carousel
      animation="slide"
      autoPlay={true}
      interval={4000}
      duration={900}
      stopAutoPlayOnHover={true}
      cycleNavigation={true}
      indicators={true}
      navButtonsAlwaysVisible={true}
      navButtonsProps={{
        style: {
          backgroundColor: "#242C54"
        }
      }}
      sx={{ width: "100%", height: { xs: 300, sm: 500, md: 600 } }}
    >
      {items.map((item, i) => (
        <Item key={i} item={item} />
      ))}
    </Carousel>
  )
}

export default CarouselComponent