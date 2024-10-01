import Navbar from "../../components/Navbar/Navbar";
import React, { useState, useEffect } from "react";
import {
  Table,
  Container,
  Button,
  Row,
  Col,
  Modal,
  Form,
} from "react-bootstrap";
import Swal from "sweetalert2";
import "./Report.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import Authentication from "../../Auth.service";

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    document.title = "Reports";

    const checkCurrentUser = async () => {
      const res = await Authentication.getCurrentUser();
      if (res) {
        setToken(JSON.stringify(res.token));
        setUser(res.user);
      }
    };

    checkCurrentUser();
  }, [navigate]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get("/administration/get-reports");
        if (user && user.office_id === 0) {
          setReports(response.data.data);
        } else if (user) {
          setReports(response.data.data.filter(report => report.office_id === user.office_id));
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    if (user) {
      fetchReports();
    }
  }, [user]);

  const handleDeleteReport = async (report_id) => {
    try {
      await api.delete(`/administration/delete-report/${report_id}`);
      Swal.fire("Deleted!", "The report has been deleted.", "success");
      setReports(reports.filter(report => report.report_id !== report_id));
    } catch (error) {
      console.error("Error deleting report:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "An error occurred while deleting the report.",
        "error"
      );
    }
  };

  return (
    <>
      <Navbar />
      <Container className="down mt-5">
        <Row className="mb-4">
          <Col>
            <h1 className="text-center">Reports</h1>
          </Col>
        </Row>
        {reports.length === 0 ? (
          <Row>
            <Col>
              <p className="text-center">There are no reports to display.</p>
            </Col>
          </Row>
        ) : (
          <Table
            striped
            bordered
            hover
            className="table-responsive"
            style={{
              borderColor: "#00b0ff",
            }}
          >
            <thead style={{ backgroundColor: "#00b0ff", color: "#fff" }}>
              <tr>
                <th>Reporter</th>
                <th>Observation</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.report_id}>
                  <td>{report.first_name} {" "} {report.last_name}</td>
                  <td>{report.observation}</td>
                  <td>{report.content}</td>
                  <td>
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={() => {
                        Swal.fire({
                          title: "Are you sure?",
                          text: "This action will ignore and delete the report.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#3085d6",
                          cancelButtonColor: "#d33",
                          confirmButtonText: "Yes, ignore it!",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleDeleteReport(report.report_id);
                          }
                        });
                      }}
                      style={{
                        backgroundColor: "#00b0ff",
                        borderColor: "#00b0ff",
                      }}
                    >
                      Ignore Report
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        Swal.fire({
                          title: "Are you sure?",
                          text: "You won't be able to revert this!",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#3085d6",
                          cancelButtonColor: "#d33",
                          confirmButtonText: "Yes, delete it!",
                        }).then(async (result) => {
                          if (result.isConfirmed) {
                            try {
                              await api.delete(
                                `/comment/delete-comment/${report.report_id}`
                              );
                              Swal.fire(
                                "Deleted!",
                                "The comment has been deleted.",
                                "success"
                              );
                              setReports(
                                reports.filter(
                                  (reportItem) => reportItem.report_id !== report.report_id
                                )
                              );
                            } catch (error) {
                              console.error("Error deleting comment:", error);
                              Swal.fire(
                                "Error!",
                                error.response?.data?.message || "An error occurred.",
                                "error"
                              );
                            }
                          }
                        });
                      }}
                    >
                      Delete Comment
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
};

export default Reports;
