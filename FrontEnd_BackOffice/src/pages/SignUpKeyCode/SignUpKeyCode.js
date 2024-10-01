import { useCallback, useRef, useState } from "react";
import { useEffect } from "react";
import "./SignUpKeyCode.css";

const SignUpKeyCode = () => {

  useEffect(() => {
    document.title = "SoftShares - SignUpKeyCode";
  }, []);

  const [keyCode, setKeyCode] = useState(Array(7).fill(""));
  const inputRefs = useRef([]);

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    if (value.length <= 1) {
      const newKeyCode = [...keyCode];
      newKeyCode[index] = value;
      setKeyCode(newKeyCode);


      if (value && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      }

      else if (!value && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    alert("Pasting is not allowed.");
  };

  const handleCopy = (e) => {
    e.preventDefault();
    alert("Copying is not allowed.");
  };

  const onArrowLeftIcon1Click = useCallback(() => {

  }, []);

  return (
    <div className="container signupkeycode d-flex flex-column align-items-center" onPaste={handlePaste} onCopy={handleCopy}>
      <div className="softshares-frame text-center">
        <h1 className="softshares2">
          <span className="softshares-txt1">
            <span>Soft</span>
            <span className="shares2">Shares</span>
          </span>
        </h1>
      </div>
      <div className="frame-parent d-flex flex-column align-items-center">
        <div className="rectangle-parent1 p-4 text-center">
          <div className="d-flex justify-content-center align-items-center mb-3">
            <img
              className="arrow-left-icon"
              loading="lazy"
              alt=""
              src="/assets/arrowleft.svg"
            />
            <h1 className="insert-keycode mx-3">Insert Keycode</h1>
            <img
              className="arrow-left-icon1"
              loading="lazy"
              alt=""
              src="/assets/arrowleft-1.svg"
              onClick={onArrowLeftIcon1Click}
            />
          </div>
          <div className="a-keycode-has-been-sent-to-you-wrapper mb-3">
            <h2 className="a-keycode-has-container">
              <p className="a-keycode-has">A keycode has been sent to your email</p>
              <p className="it-will-be">It will be valid for 2 mins</p>
            </h2>
          </div>
          <div className="frame-wrapper5">
            <div className="input-container mt-5 d-flex justify-content-center">
              {/* {keyCode.map((code, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  className="keycode-input mx-1"
                  value={code}
                  onChange={(e) => handleInputChange(e, index)}
                  onPaste={handlePaste}
                  onCopy={handleCopy}
                />
              ))} */}
              <div className="inputToken">

              <input type="text" name="" id="" className="XPTOP" maxLength={7} />
              


              </div>
              
            </div>
            <a href="#" className="mt-0 did-not-receive-code">Did not receive the code</a>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpKeyCode;
