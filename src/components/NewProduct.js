import React from "react";
import { Auth, Storage, API, graphqlOperation } from "aws-amplify";
import { PhotoPicker } from "aws-amplify-react";
import { createProduct } from "../graphql/mutations";
import { convertDollarsToCents } from "../utils";
import { Form, Button, Input, Notification } from "element-react";
import aws_exports from "../aws-exports";

const initialState = {
  description: "",
  image: "",
  imagePreview: "",
  price: "",
  isUploading: false
};

class NewProduct extends React.Component {
  state = { ...initialState };

  handleSubmit = async event => {
    event.preventDefault();
    this.setState({ isUploading: true });
    const visibility = "public";
    const { identityId } = await Auth.currentCredentials();
    const filename = `/${visibility}/${identityId}/${Date.now()}-${
      this.state.image.name
    }`;
    const uploadedFile = await Storage.put(filename, this.state.image.file, {
      contentType: this.state.image.type,
      progressCallback(progress) {
        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
      }
    });
    const file = {
      key: uploadedFile.key,
      bucket: aws_exports.aws_user_files_s3_bucket,
      region: aws_exports.aws_project_region
    };
    const input = {
      price: convertDollarsToCents(this.state.price),
      description: this.state.description,
      productMarketId: this.props.marketId,
      file
    };
    const result = await API.graphql(
      graphqlOperation(createProduct, { input })
    );
    console.log("Uploaded file", result);
    Notification({
      title: "Success",
      message: "Product successfully created!",
      type: "success"
    });
    this.setState({ ...initialState });
  };

  render() {
    const { image, imagePreview, description, price, isUploading } = this.state;

    return (
      <>
        <h2 className="header">Add New Product</h2>
        <div className="market-header">
          <Form onSubmit={this.handleSubmit} className="market-header">
            <Form.Item label="Add Description">
              <Input
                type="text"
                icon="information"
                placeholder="Description"
                value={description}
                onChange={description => this.setState({ description })}
              />
            </Form.Item>
            <Form.Item label="Add Price">
              <Input
                type="number"
                icon="plus"
                placeholder="Price (USD)"
                value={price}
                onChange={price => this.setState({ price })}
              />
            </Form.Item>
            {imagePreview && (
              <img
                className="image-preview"
                src={imagePreview}
                alt="Product Preview"
              />
            )}
            <PhotoPicker
              title="Product Image"
              preview="hidden"
              onLoad={url => this.setState({ imagePreview: url })}
              onPick={file => this.setState({ image: file })}
              theme={{
                formContainer: {
                  margin: 0,
                  padding: "0.8em",
                  minWidth: "250px",
                  maxHeight: "300px"
                },
                sectionHeader: {
                  padding: "0.2em",
                  color: "var(--darkAmazonOrange)"
                },
                photoPickerButton: {
                  display: "none"
                }
              }}
            />
            <Form.Item>
              <Button
                onClick={this.handleSubmit}
                disabled={!image || !description || !price || isUploading}
                loading={isUploading}
                type="primary"
              >
                {isUploading ? "Uploading..." : "Add Product"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </>
    );
  }
}

export default NewProduct;
