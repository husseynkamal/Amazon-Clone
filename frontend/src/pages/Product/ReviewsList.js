import React from "react";
import { Col, ListGroup } from "react-bootstrap";

import { dateConverter } from "../../util/date-converter";
import Rating from "../../components/UI/Rating/Rating";

const ReviewsList = ({ reviews }) => {
  const review =
    reviews && reviews.length > 0
      ? reviews.map((review) => {
          return (
            <ListGroup.Item key={Math.random().toString()}>
              <strong>{review.userName}</strong>
              <Rating rating={review.rating} />
              <p>{dateConverter(review.createdAt)}</p>
              <p>{review.comment}</p>
            </ListGroup.Item>
          );
        })
      : null;

  return (
    <Col className="my-5">
      <ListGroup>{review}</ListGroup>
    </Col>
  );
};

export default ReviewsList;
