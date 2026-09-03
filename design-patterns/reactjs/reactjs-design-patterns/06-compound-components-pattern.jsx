// Compound Components Pattern - Components that work together to form a complete UI
// Use case: Flexible component APIs, consistent behavior, shared state between components

import React, { createContext, useContext, useState, Children } from 'react';

// ===== Accordion Compound Component =====
const AccordionContext = createContext();

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionItem must be used within Accordion');
  }
  return context;
};

const Accordion = ({ children, allowMultiple = false }) => {
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleItem = (id) => {
    setExpandedIds(prev => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };

  const value = { expandedIds, toggleItem };

  return (
    <AccordionContext.Provider value={value}>
      <div className="border rounded-lg overflow-hidden">
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = ({ id, children }) => {
  const { expandedIds, toggleItem } = useAccordionContext();
  const isExpanded = expandedIds.includes(id);

  return (
    <div className="border-b last:border-b-0">
      {Children.map(children, child => {
        if (child.type === AccordionHeader) {
          return React.cloneElement(child, {
            isExpanded,
            onClick: () => toggleItem(id)
          });
        }
        if (child.type === AccordionContent) {
          return React.cloneElement(child, { isExpanded });
        }
        return child;
      })}
    </div>
  );
};

const AccordionHeader = ({ children, isExpanded, onClick }) => (
  <button
    onClick={onClick}
    className="w-full px-6 py-4 text-left font-semibold bg-gray-100 hover:bg-gray-200 transition flex justify-between items-center"
  >
    {children}
    <span className={`transform transition ${isExpanded ? 'rotate-180' : ''}`}>
      ▼
    </span>
  </button>
);

const AccordionContent = ({ children, isExpanded }) => (
  isExpanded && <div className="px-6 py-4 bg-white">{children}</div>
);

// ===== Tabs Compound Component =====
const TabsContext = createContext();

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabPane must be used within Tabs');
  }
  return context;
};

const Tabs = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const value = { activeTab, setActiveTab };

  return (
    <TabsContext.Provider value={value}>
      <div className="w-full">
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabList = ({ children }) => {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <div className="flex border-b">
      {Children.map(children, (child, index) =>
        React.cloneElement(child, {
          index,
          isActive: activeTab === index,
          onClick: () => setActiveTab(index)
        })
      )}
    </div>
  );
};

const Tab = ({ children, index, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-semibold transition border-b-2 ${
      isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-800'
    }`}
  >
    {children}
  </button>
);

const TabContent = ({ children }) => {
  const { activeTab } = useTabs();

  return (
    <div>
      {Children.map(children, (child, index) =>
        React.cloneElement(child, { isActive: activeTab === index })
      )}
    </div>
  );
};

const TabPane = ({ children, isActive }) => (
  isActive && <div className="p-6">{children}</div>
);

// ===== Modal Compound Component =====
const ModalContext = createContext();

const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within Modal');
  }
  return context;
};

const Modal = ({ children, isOpen, onClose }) => {
  const value = { isOpen, onClose };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ModalContext.Provider value={value}>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          {children}
        </div>
      </ModalContext.Provider>
    </div>
  );
};

const ModalHeader = ({ children, title }) => {
  const { onClose } = useModal();

  return (
    <div className="flex justify-between items-center px-6 py-4 border-b">
      <h2 className="text-xl font-bold">{title || children}</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 text-2xl"
      >
        ×
      </button>
    </div>
  );
};

const ModalBody = ({ children }) => (
  <div className="px-6 py-4">
    {children}
  </div>
);

const ModalFooter = ({ children }) => (
  <div className="px-6 py-4 border-t flex gap-2 justify-end">
    {children}
  </div>
);

// ===== Card Compound Component =====
const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-lg">
    {children}
  </div>
);

const CardHeader = ({ children, title, subtitle }) => (
  <div className="px-6 py-4 border-b">
    {title && <h3 className="text-lg font-bold">{title}</h3>}
    {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
    {children}
  </div>
);

const CardBody = ({ children }) => (
  <div className="px-6 py-4">
    {children}
  </div>
);

const CardFooter = ({ children }) => (
  <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
    {children}
  </div>
);

// ===== Demo Components =====

const AccordionDemo = () => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold mb-4">Accordion</h2>
    <Accordion allowMultiple={true}>
      <AccordionItem id="item1">
        <AccordionHeader>What is React?</AccordionHeader>
        <AccordionContent>
          React is a JavaScript library for building user interfaces with reusable components.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem id="item2">
        <AccordionHeader>What are hooks?</AccordionHeader>
        <AccordionContent>
          Hooks are functions that let you use state and other React features in functional components.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem id="item3">
        <AccordionHeader>What is JSX?</AccordionHeader>
        <AccordionContent>
          JSX is a syntax extension to JavaScript that lets you write HTML-like code in JavaScript.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

const TabsDemo = () => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold mb-4">Tabs</h2>
    <Tabs defaultTab={0}>
      <TabList>
        <Tab>Profile</Tab>
        <Tab>Settings</Tab>
        <Tab>Security</Tab>
      </TabList>

      <TabContent>
        <TabPane>
          <Card>
            <CardBody>
              <h3 className="font-bold mb-2">Profile Information</h3>
              <p className="text-gray-600">Name: John Doe</p>
              <p className="text-gray-600">Email: john@example.com</p>
              <p className="text-gray-600">Role: Administrator</p>
            </CardBody>
          </Card>
        </TabPane>

        <TabPane>
          <Card>
            <CardBody>
              <h3 className="font-bold mb-2">Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span>Email notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>SMS notifications</span>
                </label>
              </div>
            </CardBody>
          </Card>
        </TabPane>

        <TabPane>
          <Card>
            <CardBody>
              <h3 className="font-bold mb-2">Security</h3>
              <p className="text-gray-600 mb-4">Last login: 2 hours ago</p>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Change Password
              </button>
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>
    </Tabs>
  </div>
);

const ModalDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Modal</h2>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
      >
        Open Modal
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader title="Confirm Action" />
        <ModalBody>
          <p>Are you sure you want to proceed with this action?</p>
        </ModalBody>
        <ModalFooter>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const CardDemo = () => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold mb-4">Card Components</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader title="Product" subtitle="Premium Package" />
        <CardBody>
          <p className="text-2xl font-bold text-blue-600 mb-2">$99/month</p>
          <p className="text-gray-600 mb-4">Get access to premium features and priority support.</p>
        </CardBody>
        <CardFooter>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Subscribe Now
          </button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader title="Features" />
        <CardBody>
          <ul className="space-y-2 text-gray-600">
            <li>✓ Advanced analytics</li>
            <li>✓ Priority support</li>
            <li>✓ Custom domains</li>
            <li>✓ API access</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  </div>
);

// Main Demo
export const CompoundComponentsDemo = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Compound Components Pattern</h1>

      <AccordionDemo />
      <TabsDemo />
      <ModalDemo />
      <CardDemo />

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Compound Components Benefits</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>✓ Flexible and composable component APIs</li>
          <li>✓ Implicit state sharing between components</li>
          <li>✓ Great developer experience</li>
          <li>✓ Components work well together</li>
          <li>✓ Reduces prop drilling</li>
          <li>⚠️ Requires careful component structure</li>
          <li>⚠️ Harder to refactor later</li>
        </ul>
      </div>
    </div>
  );
};

export default CompoundComponentsDemo;
